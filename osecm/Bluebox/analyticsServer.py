# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""


import collections
from datetime import datetime
from functools import wraps
import json, logging, time, re

from bokeh.charts import Area, show, vplot, output_file, Bar, Line
from bokeh.io import vform
from bokeh.embed import components 
from bokeh.charts.operations import blend
from flask import request, Response, send_file, render_template
import requests

from osecm.Bluebox import app
from osecm.Bluebox import appConfig
from osecm.Bluebox.exceptions import HttpError
import pandas


logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()




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





def doPlot1(data, nrDataSource):
	p = Bar(data, data.columns[0], values=data.columns[1], title="Bar graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=data.columns[1], responsive=True)
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c

def doPlot11(data, nrDataSource):
	p = Bar(data, 
		label=data.columns[0],
		group=data.columns[0],
		y_mapper_type="log", 
		values=blend(data.columns[1],data.columns[2], name="values", labels_name=data.columns[0]), 
		title="Line graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=data.columns[1], responsive=True)
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c


def doPlot2(data, nrDataSource):
	plots = []
	for thisColumn in data.columns[1:]:
		plots.append(Bar(data, data.columns[0], values=thisColumn, title="Bar graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=thisColumn, responsive=True))
	c = components(vplot(*plots), resources=None, wrap_script=False, wrap_plot_info=True)
	return c


def getListOfKeys(d):
	keys = []
	for k in d.keys():
		keys.append(k)
	return keys



@app.route("/api_analytics/plot/<plotType>", methods=["GET"])
def doPlot(plotType):
	nrDataSource = json.loads(request.args.get("nrDataSource"))
	print(nrDataSource)
	url = appConfig.nodered_url + nrDataSource['url']
	r = requests.get(url)
	if r.status_code == 404:
		raise HttpError("the Node-RED data source is not reachable: {}".format(url), 420)

	try:
		data = json.JSONDecoder(object_pairs_hook=collections.OrderedDict).decode(r.content.decode())
		dataKeys = getListOfKeys(data[0])
		
		df = pandas.DataFrame(data, columns=dataKeys)
		df[dataKeys[0]] = df[dataKeys[0]].map(lambda x: str(x)[:20])
		print(df)
		
		if('2bar' == plotType):
			c = doPlot2(data=df, nrDataSource=nrDataSource)
		elif('bar' == plotType):
			c = doPlot1(data=df, nrDataSource=nrDataSource)
		elif('line' == plotType):
			c = doPlot11(data=df, nrDataSource=nrDataSource)
			
			
		print(nrDataSource, plotType)
		return Response(json.dumps(c), mimetype="application/json")
	except:
		log.exception("plotting error:")
		raise HttpError("the Node-RED data source produced malformatted data", 500)


@app.route("/api_analytics/nrsources", methods=["GET"])
def getNodeRedEnpointList():
	n = requests.get(appConfig.nodered_url + "/flows").json()
	sources = []
	for s in n:
		# Node-RED has a strange API... we can't reconstruct node/flow relationships...
		# if ('tab' == s['type'] and 'label' in s):
		# 	thisFlowName = s['label'] + "->"
		if ('http in' == s['type'] and 'url' in s): 
			sources.append({"url": s['url'], "name": s['name']})
	return Response(json.dumps(sources), mimetype="application/json")
