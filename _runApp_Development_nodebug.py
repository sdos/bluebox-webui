# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

from mcm.Bluebox import app
from mcm.Bluebox import configuration

# socketio.run(
# 			app,
app.run(
    host=configuration.my_bind_host,
    port=int(configuration.my_endpoint_port),
    debug=False,
    threaded=True
)
