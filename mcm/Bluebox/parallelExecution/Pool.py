#!/usr/bin/python
# coding=utf-8

"""
	Project MCM - Micro Content Management


	Copyright (C) <2016> Tim Waizenegger, <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.


	@author: tim

"""
import os

from pykafka import KafkaClient
from pykafka.common import OffsetType

from mcm.Bluebox.parallelExecution import Borg

RUNNING_ON_GUNICORN = bool(os.getenv("RUNNING_ON_GUNICORN", False))


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
            return kc

    def getTopic(self, kafka_broker_endpoint, topic_name):
        instance_id = (kafka_broker_endpoint, topic_name)
        try:
            return self.__topicPool[instance_id]
        except:
            client = self.getClient(kafka_broker_endpoint)
            t = client.topics[topic_name.encode('utf-8')]
            self.__topicPool[instance_id] = t
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
                                          use_rdkafka=not RUNNING_ON_GUNICORN,
                                          auto_commit_enable=False,
                                          auto_offset_reset=OffsetType.LATEST,
                                          reset_offset_on_start=False,
                                          consumer_timeout_ms=1000)
            self.__consumerPool[instance_id] = c
            return c
