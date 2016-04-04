# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import os
import multiprocessing

netPort = os.getenv("VCAP_APP_PORT", "5000")
netHost = os.getenv("VCAP_APP_HOST", "0.0.0.0")


bind = "{}:{}".format(netHost, netPort)
workers = multiprocessing.cpu_count() * 2 + 1
#workers = 1 #
timeout = 600
graceful_timeout = 800
worker_class = "gevent"
#worker_class = "eventlet"
#worker_class = "geventwebsocket.gunicorn.workers.GeventWebSocketWorker"