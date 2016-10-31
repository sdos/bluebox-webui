# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import logging
from flask import Flask
#from flask_socketio import SocketIO

log = logging.getLogger()

app = Flask(__name__, static_folder="angular")
#socketio = SocketIO(app)

import mcm.Bluebox.APIServer
import mcm.Bluebox.TasksServer
import mcm.Bluebox.analyticsServer
import mcm.Bluebox.metadataServer
import mcm.Bluebox.accountServer







