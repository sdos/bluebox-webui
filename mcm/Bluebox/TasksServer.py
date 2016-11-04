# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.


	This
"""
import json
import logging
import os
import socket
import uuid

from flask import request, Response
from pykafka import KafkaClient

from mcm.Bluebox import accountServer
from mcm.Bluebox import app
from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError

log = logging.getLogger()

API_ROOT = "/api_tasks"

"""
Message definition
"""
valid_task_types = {"identify_content": "Identify content types",
                    "extract_metadata": "Extract metadata",
                    "replicate_metadata": "Replicate metadata",
                    "dispose": "Dispose of old objects",
                    "ping": "ping"}

"""
Helpers
"""

value_serializer = lambda v: json.dumps(v).encode('utf-8')


def __try_parse_msg_content(m):
	try:
		return json.loads(m.value.decode("utf-8"))
	except Exception as e:
		return {"type": "Error", "error": "msg parsing failed"}


"""
	Connection
"""


def __get_kafka_topic(topic):
	kc = KafkaClient(hosts=appConfig.kafka_broker_endpoint, use_greenlets=True)
	return kc.topics[topic.encode('utf-8')]


@app.route(API_ROOT + "/types", methods=["GET"])
def get_valid_tasks():
	return Response(json.dumps(valid_task_types), mimetype="application/json")


@app.route(API_ROOT + "/send_message", methods=["POST"])
def send_message():
	log.debug("got message: {}".format(request.json))
	worker_id = "MCMBluebox-{}-{}".format(socket.getfqdn(), os.getpid())
	try:
		msg_type = request.json.get("type")
		msg_tenant = request.json.get("tenant")

		if (not msg_type or not msg_type in valid_task_types):
			raise HttpError("Request is invalid", 500)

		"""
		we only assert that the token in the request is valid
		and that the tenant is the current tenant.
		the token in the message is not validated, this is up to the recipient.
		some msgs may not even contain a token...
		"""
		accountServer.assert_no_xsrf(request)
		accountServer.assert_token_tenant_validity(request)
		accountServer.assert_correct_tenant(request, msg_tenant)

		j = request.json
		j["correlation"] = str(uuid.uuid4())
		j["worker"] = worker_id

		with __get_kafka_topic(msg_tenant).get_producer() as producer:
			producer.produce(value_serializer(request.json))

		r = Response()
		return r
	except HttpError as e:
		raise (e)
	except Exception:
		m = "Error sending message"
		log.exception(m)
		raise HttpError(m, 500)


@app.route(API_ROOT + '/receive_all_messages', methods=['POST'])
def receive_all_messages():
	return receive_messages(from_beginning=True)


@app.route(API_ROOT + '/receive_messages', methods=['POST'])
def receive_messages(from_beginning=False):
	"""
	we subscribe to our tenant-topic to see all the sent messages. Our client-ID is tenant-bound
	so that we receive all msgs for that tenant, and so that kafka can maintain a global offset for this tenant
	 our group-id is token bound so that it is unique across all consumers within this tenant; this will
	 make kafka broadcast msgs to all consumers within this tenant
	 --> every logged in session will see all new messages for the tenant and every message
	 will be seen by at least one of the sessions
	:return:
	"""
	log.debug("receiving messages for: {}".format(request.json))
	try:
		msg_tenant = request.json.get("tenant")
		msg_client_id = request.json.get("client_id")

		accountServer.assert_no_xsrf(request)
		accountServer.assert_token_tenant_validity(request)
		accountServer.assert_correct_tenant(request, msg_tenant)

		consumer_group = 'mcmbb-{}-{}'.format(msg_tenant, msg_client_id).encode('utf-8')

		topic = __get_kafka_topic(msg_tenant)
		consumer = topic.get_simple_consumer(consumer_group=consumer_group, consumer_id=consumer_group,
		                                     consumer_timeout_ms=100, auto_commit_enable=False)

		if from_beginning:
			partition_offset_pairs = [(p, p.latest_available_offset()) for p in consumer.partitions.values()]
			consumer.reset_offsets(partition_offsets=partition_offset_pairs)

		vals = [__try_parse_msg_content(m) for m in consumer]

		if not from_beginning:
			consumer.commit_offsets()
		consumer.stop()
		return Response(json.dumps(vals), mimetype="application/json")

	except HttpError as e:
		raise e

	except Exception:
		m = "Error retrieving messages"
		log.exception(m)
		raise HttpError(m, 500)
