# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

from Bluebox import app, socketio


import os

netPort = os.getenv("VCAP_APP_PORT", "5000")
netHost = os.getenv("VCAP_APP_HOST", "0.0.0.0")

#app.run(
socketio.run(
			app,
			host=netHost,
			port=int(netPort),
			debug=True
)