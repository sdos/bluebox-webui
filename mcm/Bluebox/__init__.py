# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

# change the monkey patch depending on used worker type
from gevent import monkey
monkey.patch_all()

#import eventlet
#eventlet.monkey_patch()

from flask import Flask


app = Flask(__name__, static_folder="angular")

import mcm.Bluebox.APIServer
import mcm.Bluebox.analyticsServer
import mcm.Bluebox.metadataServer
import mcm.Bluebox.accountServer







