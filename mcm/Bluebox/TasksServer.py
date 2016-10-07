# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import collections
from io import StringIO
from datetime import datetime
from functools import wraps
import json, logging, time, re
from urllib import parse as urlParse


from flask import request, Response, send_file, render_template
import requests
from kafka.errors import KafkaTimeoutError, KafkaError

from mcm.Bluebox.SwiftConnect import are_tenant_token_valid
from mcm.Bluebox import app
from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError

from kafka import KafkaProducer, KafkaConsumer


log = logging.getLogger()


valid_task_types = {"identify_content": "Identify content types",
						"extract_metadata": "Extract metadata",
						"replicate_metadata": "Replicate metadata",
						"disposal": "Dispose old objects"}

kafka_timeout = 10
kafka_producer = KafkaProducer(
	bootstrap_servers='192.168.209.208:9092',
	value_serializer=lambda v: json.dumps(v).encode('utf-8'))

@app.route("/api_tasks/types", methods=["GET"])
def get_valid_tasks():
	return Response(json.dumps(valid_task_types), mimetype="application/json")



@app.route("/api_tasks/send_message", methods=["POST"])
def send_message():
	log.debug("got message: {}".format(request.json))
	try:
		msg_type = request.json.get("type")
		msg_container = request.json.get("container")
		msg_tenant = request.json.get("tenant")
		msg_token = request.json.get("token")

		if(not msg_type or not msg_type in valid_task_types):
			raise HttpError("Task type is invalid", 500)

		if not are_tenant_token_valid(tenant=msg_tenant, token=msg_token):
			raise HttpError("Credentials are not valid", 500)

		kafka_producer.send(msg_tenant, request.json).get(timeout=kafka_timeout)


		r = Response()
		return r
	except KafkaTimeoutError:
		m = "Could not send msg to Kafka broker; timed out after {} sec.".format(kafka_timeout)
		log.exception(m)
		raise HttpError(m, 500)
	except KafkaError:
		m = "Error handling message"
		log.exception(m)
		raise HttpError(m, 500)



@app.route("/api_tasks/receive_messages", methods=["POST"])
def receive_messages():
	"""
	we subscribe to our tenant-topic to see all the sent messages. Our client-ID is tenant-bound
	so that we receive all msgs for that tenant, and so that kafka can maintain a global offset for this tenant
	 our group-id is token bound so that it is unique across all consumers within this tenant; this will
	 make kafka broadcast msgs to all consumers within this tenant
	 --> every logged in session will see all new messages for the tenant and every message will be seen by one of the sessions
	:return:
	"""
	log.debug("receiving messages for: {}".format(request.json))
	try:
		msg_tenant = request.json.get("tenant")
		msg_token = request.json.get("token")
		if not are_tenant_token_valid(tenant=msg_tenant, token=msg_token):
			raise HttpError("Credentials are not valid", 500)

		c = KafkaConsumer(msg_tenant,
		                  bootstrap_servers='192.168.209.208:9092',
		                  client_id='mcmbb-{}'.format(msg_tenant),
		                  group_id='mcmbb-{}-{}'.format(msg_tenant, msg_token[25:]),
		                  consumer_timeout_ms=100)
		msgs = list(c)
		c.close()
		vals = [json.loads(m.value.decode("utf-8")) for m in msgs]
		return Response(json.dumps(vals), mimetype="application/json")

	except Exception:
		m = "Error retrieving messages"
		log.exception(m)
		raise HttpError(m, 500)
