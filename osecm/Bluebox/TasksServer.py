# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
from osecm.Bluebox import app#, socketio
from flask import Response
#import eventlet
#from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect


# @socketio.on('message')
# def handle_message(message):
# 	print('received message: ' + message)
# 	
# 	
# 	
# @app.route("/messaging/test", methods=["GET"])	
# def publish():
# 	socketio.emit("e1", "hallo")
# 	return "OK"