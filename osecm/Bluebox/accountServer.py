# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import logging

from functools import wraps

from flask import request, Response, send_file, render_template
import requests

from osecm.Bluebox import app
from osecm.Bluebox import appConfig
from osecm.Bluebox.exceptions import HttpError


log = logging.getLogger()


"""

create initial connection string

"""

swiftRcString = """
#!/bin/bash
export ST_AUTH={auth}
export ST_USER={tenant}:<your username>
export ST_KEY=<your password>


"""



"""

HTTP-API endpoints

"""

@app.route("/api_account/account", methods=["GET"])
def getAccount():
	s = swiftRcString.format(auth=appConfig.swift_url, tenant = appConfig.swift_tenant)
	return Response(s, mimetype="text/plain")




