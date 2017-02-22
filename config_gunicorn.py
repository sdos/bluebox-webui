# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015,2016,2017> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import multiprocessing

from mcm.Bluebox import configuration

bind = "{}:{}".format(configuration.my_bind_host, configuration.my_endpoint_port)

workers = multiprocessing.cpu_count() * 2 + 1
workers = workers * 1
# workers = 1 #
timeout = 600
graceful_timeout = 800

# change the monkey patch depending on used worker type
# in file: __init__.py

worker_class = "gevent"
# worker_class = "eventlet"
# worker_class = "geventwebsocket.gunicorn.workers.GeventWebSocketWorker"
