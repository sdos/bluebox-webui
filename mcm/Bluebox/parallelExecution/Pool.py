#!/usr/bin/python
# coding=utf-8

"""
	Project MCM - Micro Content Management


	Copyright (C) <2016> Tim Waizenegger, <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.


	@author: tim

"""
from mcm.Bluebox.parallelExecution import Borg
from pykafka import KafkaClient


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
		except:
			self.__clientPool = dict()
			self.__topicPool = dict()

	def getClient(self, kafka_broker_endpoint):
		try:
			return self.__clientPool[kafka_broker_endpoint]
		except:
			kc = KafkaClient(hosts=kafka_broker_endpoint, use_greenlets=False)
			self.__clientPool[kafka_broker_endpoint] = kc
			return kc

	def getTopic(self, kafka_broker_endpoint, topic_name):
		try:
			return self.__topicPool[(kafka_broker_endpoint, topic_name)]
		except:
			client = self.getClient(kafka_broker_endpoint)
			t = client.topics[topic_name.encode('utf-8')]
			self.__topicPool[(kafka_broker_endpoint, topic_name)] = t
			return t

	def count(self):
		try:
			self.c += 1
		except:
			self.c = 0

		print(self.c)