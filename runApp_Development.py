# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import Bluebox.appConfig
from Bluebox import app

app.run(
	host=Bluebox.appConfig.netHost,
	port=int(Bluebox.appConfig.netPort),
	debug=True
)