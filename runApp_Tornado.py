# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

import Bluebox.appConfig
from Bluebox import app

http_server = HTTPServer(WSGIContainer(app))
http_server.max_buffer_size=8000000000
http_server.bind(
				port=int(Bluebox.appConfig.netPort),
				address=Bluebox.appConfig.netHost)
# "0" starts one process per CPU core
http_server.start(num_processes=0)
IOLoop.instance().start()
