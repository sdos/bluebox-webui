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

logging.basicConfig(level=logging.ERROR, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()

app = Flask(__name__, static_folder="angular")
#socketio = SocketIO(app)

import osecm.Bluebox.APIServer
import osecm.Bluebox.TasksServer
import osecm.Bluebox.analyticsServer
import osecm.Bluebox.metadataServer







