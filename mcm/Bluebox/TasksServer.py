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

from bokeh.charts import Area, show, vplot, output_file, Bar, Line, BoxPlot, defaults
from bokeh.io import vform
from bokeh.embed import components
from bokeh.charts.operations import blend
from flask import request, Response, send_file, render_template
import requests

from mcm.Bluebox import app
from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError
import pandas
from bokeh.models.tickers import SingleIntervalTicker
from bokeh.models.axes import LinearAxis

import sqlite3


logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()

valid_task_types = {"identify_content": "Identify content types",
						"extract_metadata": "Extract metadata",
						"replicate_metadata": "Replicate metadata",
						"disposal": "Dispose old objects"}


@app.route("/api_tasks/types", methods=["GET"])
def get_valid_tasks():
	return Response(json.dumps(valid_task_types), mimetype="application/json")