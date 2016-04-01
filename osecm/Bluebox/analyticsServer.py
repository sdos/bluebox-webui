# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""


from datetime import datetime
from functools import wraps
import json, logging, time, re

from flask import request, Response, send_file, render_template

from osecm.Bluebox import app
from osecm.Bluebox.exceptions import HttpError
from osecm.Bluebox import appConfig
from bokeh.embed import components 
import requests
import pandas as pd

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()



from bokeh.charts import Area, show, vplot, output_file, Bar

# create some example data
data = dict(
    python=[2, 3, 7, 5, 26, 221, 44, 233, 254, 265, 266, 267, 120, 111],
    pypy=[12, 33, 47, 15, 126, 121, 144, 233, 254, 225, 226, 267, 110, 130],
    jython=[22, 43, 10, 25, 26, 101, 114, 203, 194, 215, 201, 227, 139, 160],
)

area = Area(data, title="Area Chart", legend="top_left",
            xlabel='time', ylabel='memory')


@app.route("/api_analytics/nrendpoint", methods=["GET"])
def getNodeRedEndpoint():
	e = {"url":appConfig.nodered_url}
	return Response(json.dumps(e), mimetype="application/json")



@app.route("/api_analytics/plot/<plotType>", methods=["GET"])
def doPlot(plotType):
	nrDataSource = request.args.get("nrDataSource")
	
	
	url = appConfig.nodered_url + "/" + nrDataSource
	data = requests.get(url).json()
	df = pd.DataFrame(data)
	print(df)
	
	p = Bar(df, df.columns[0], values=df.columns[1], title="Bar graph of " + nrDataSource, xlabel=df.columns[0], ylabel=df.columns[1])
	
	
	
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	
	print(nrDataSource, plotType)
	return Response(json.dumps(c), mimetype="application/json")
	#return includes + "<h2>hallo</h2>" + c[0] + c[1], 200





