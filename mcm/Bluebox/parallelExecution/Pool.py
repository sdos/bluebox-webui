#!/usr/bin/python
# coding=utf-8

"""
	Project MCM - Micro Content Management


	Copyright (C) <2016> Tim Waizenegger, <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.


	@author: tim

"""
import os, logging

from pykafka import KafkaClient
from pykafka.common import OffsetType

from mcm.Bluebox.parallelExecution import Borg

RUNNING_ON_GUNICORN = bool(os.getenv("RUNNING_ON_GUNICORN", False))
LONGPOLL_DURATION_MS = 60000


class KafkaClientPool(Borg):
    """
        A singleton that manages a pool of kafka clients
        only one instance of this class exists at any time -> only one kafka client per broker
    """

    def __init__(self):
        Borg.__init__(self)

        try:
            self.__clientPool
            self.__topicPool
            self.__consumerPool
        except:
            self.__clientPool = dict()
            self.__topicPool = dict()
            self.__consumerPool = dict()

    def getClient(self, kafka_broker_endpoint):
        instance_id = kafka_broker_endpoint
        try:
            return self.__clientPool[instance_id]
        except:
            kc = KafkaClient(hosts=kafka_broker_endpoint, use_greenlets=RUNNING_ON_GUNICORN)
            self.__clientPool[instance_id] = kc
            logging.info(
                "ClientPool has no KafkaClient instance for ID: {}. New instance {} created and added to Pool. Pool size is now: {}".format(
                    instance_id, kc, len(self.__clientPool)))
            return kc

    def getTopic(self, kafka_broker_endpoint, topic_name):
        instance_id = (kafka_broker_endpoint, topic_name)
        try:
            return self.__topicPool[instance_id]
        except:
            client = self.getClient(kafka_broker_endpoint)
            t = client.topics[topic_name.encode('utf-8')]
            self.__topicPool[instance_id] = t
            logging.info(
                "TopicPool has no KafkaTopic instance for ID: {}. New instance {} created and added to Pool. Pool size is now: {}".format(
                    instance_id, t, len(self.__topicPool)))
            return t

    def getConsumer(self, kafka_broker_endpoint, topic_name, consumer_group):
        """
        reset_offset_on_start=False --> we start from last offset if client/group ID is known,
                                        offset_reset otherwise
        reset_offset_on_start=True --> we start from offset_reset always...
        :param kafka_broker_endpoint:
        :param topic_name:
        :param consumer_group:
        :return:
        """
        instance_id = (kafka_broker_endpoint, topic_name, consumer_group)
        try:
            return self.__consumerPool[instance_id]
        except:
            topic = self.getTopic(kafka_broker_endpoint, topic_name)
            """
            c = topic.get_balanced_consumer(managed=True,
                                            #	zookeeper_connect=appConfig.zookeeper_endpoint,
                                               consumer_group=consumer_group,
                                               auto_commit_enable=False,
                                               auto_offset_reset=OffsetType.LATEST,
                                               reset_offset_on_start=False,
                                               consumer_timeout_ms=-1)
            """
            c = topic.get_simple_consumer(consumer_group=consumer_group,
                                          use_rdkafka=False,
                                          auto_start=True,
                                          auto_commit_enable=False,
                                          auto_offset_reset=OffsetType.LATEST,
                                          reset_offset_on_start=True,
                                          consumer_timeout_ms=LONGPOLL_DURATION_MS,
                                          queued_max_messages=10,
                                          fetch_min_bytes=1)
            self.__consumerPool[instance_id] = c
            logging.info(
                "ConsumerPool has no KafkaConsumer instance for ID: {}. New instance {} created and added to Pool. Pool size is now: {}".format(
                    instance_id, c, len(self.__consumerPool)))
            return c
