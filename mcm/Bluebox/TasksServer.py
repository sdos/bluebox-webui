# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import collections
from io import StringIO
from datetime import datetime
from functools import wraps
import json, logging, time, re
from urllib import parse as urlParse


from flask import request, Response, send_file, render_template
import requests

from mcm.Bluebox import app
from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError


import sqlite3


log = logging.getLogger()

valid_task_types = {"identify_content": "Identify content types",
						"extract_metadata": "Extract metadata",
						"replicate_metadata": "Replicate metadata",
						"disposal": "Dispose old objects"}


@app.route("/api_tasks/types", methods=["GET"])
def get_valid_tasks():
	return Response(json.dumps(valid_task_types), mimetype="application/json")





@app.route("/api_tasks/send_message", methods=["POST"])
def send_message():
	try:
		msg_type = request.json.get("type")
		msg_container = request.json.get("container")
		msg_tenant = request.json.get("tenant")
		msg_token = request.json.get("token")

		log.debug("got message: {}".format(request.json))
		r = Response()
		return r
	except Exception:
		log.exception("Message parsing error")
		raise HttpError("Message parsing error", 500)