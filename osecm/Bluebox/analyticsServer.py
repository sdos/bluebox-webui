# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

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

from osecm.Bluebox import app
from osecm.Bluebox import appConfig
from osecm.Bluebox.exceptions import HttpError
import pandas
from bokeh.models.tickers import SingleIntervalTicker
from bokeh.models.axes import LinearAxis

import sqlite3


logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()



"""

Data schema

"""

@app.route("/api_analytics/tablestructure", methods=["GET"])
def getTableStructure():

	# Establish connection to the SQLite database
	connection = sqlite3.connect("/tmp/metadata.sqlite")
	cursor = connection.cursor()

	# Retrieve all table names
	cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC")
	tableNames = cursor.fetchall()

	tableData = {}

	# Retrieve the column names for the corresponding tables
	for table in tableNames:
		cursor.execute("PRAGMA table_info(" + table[0] + ")")
		columnNames = cursor.fetchall()

		# Retrieve the first 5 entries from each table
		cursor.execute("SELECT * FROM " + table[0] + " LIMIT 5")
		rowValues = cursor.fetchall()

		# Dictionary which combines column names and row entries
		columnStructure = {}

		# Strip columnNames from not required data
		columnList = []

		for column in columnNames:
			columnList.append(column[1])

		# Populate final dictionary table Data
		columnStructure['columnNames'] = columnList
		columnStructure['rowEntries'] = rowValues
		tableData[table[0]] = columnStructure

	# Close database connection after retrieval
	connection.close()

	return Response(json.dumps(tableData), mimetype="application/json")


"""

PLOTS

"""

def doPlot1(data, nrDataSource):
	p = Bar(data, data.columns[0], values=data.columns[1], title="Bar graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=data.columns[1], responsive=True)
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c

def doPlot1log(data, nrDataSource):
	p = Bar(data, data.columns[0], values=data.columns[1], title="Bar graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=data.columns[1], responsive=True, y_mapper_type="log")
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c

def doPlot11(data, nrDataSource):
	p = Line(data, title="Line graph: " + nrDataSource['name'], xlabel=data.columns[0], ylabel=data.columns[1], responsive=True)
	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c


def doPlot_Box(data, nrDataSource):
	p = BoxPlot(data, values=data.columns[1], label=data.columns[0], marker='square',
				color=data.columns[0],
				title="BoxPlot: " + nrDataSource['name'])

	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c

def doPlot_stackedBar(data, nrDataSource):
	p = Bar(data, data.columns[0], values=data.columns[1], title="StackedBar graph: " + nrDataSource['name'],
			xlabel=data.columns[0], ylabel=data.columns[1], plot_width=900, responsive=True)

	c = components(p, resources=None, wrap_script=False, wrap_plot_info=True)
	return c

def doPlot_Area(data, nrDataSource):
	p = Area(data, title="Area Chart: " + nrDataSource['name'], legend="top_left",
				xlabel=data.columns[0], ylabel=data.columns[1])

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




"""

HTTP-API endpoints

"""

def getDataFromNodeRed(nrDataSource):
	url = appConfig.nodered_url + nrDataSource['url']
	log.debug("getting data from node red at: {}".format(url))
	r = requests.get(url)
	if r.status_code == 404:
		raise HttpError("the Node-RED data source is not reachable: {}".format(url), 420)
	try:
		data = json.JSONDecoder(object_pairs_hook=collections.OrderedDict).decode(r.content.decode())
		dataKeys = getListOfKeys(data[0])
		df = pandas.DataFrame(data, columns=dataKeys)
		df[dataKeys[0]] = df[dataKeys[0]].map(lambda x: str(x)[:20])
		return df

	except:
		log.exception("JSON parse error:")
		raise HttpError("the Node-RED result is no valid JSON", 500)






@app.route("/api_analytics/table", methods=["GET"])
def doTable():
	nrDataSource = json.loads(urlParse.unquote(request.args.get("nrDataSource")))
	log.debug("producing table for: {}".format(nrDataSource))
	data = getDataFromNodeRed(nrDataSource=nrDataSource)
	#log.debug("our pandas data frame is: {}".format(data.to_json(orient="records")))
	info = StringIO()
	data.info(verbose=False, buf=info)
	r = {
		"table" : data[:50].to_json(orient="records"),
		"info" : info.getvalue(),
		"truncated" : (len(data) > 50)
		}
	#print(r)
	return Response(json.dumps(r), mimetype="application/json")


@app.route("/api_analytics/plot", methods=["GET"])
def doPlot():
	nrDataSource = json.loads(urlParse.unquote(request.args.get("nrDataSource")))
	plotType = request.args.get("plotType")
	log.debug("producing plot: {} for: {}".format(plotType, nrDataSource))

	df = getDataFromNodeRed(nrDataSource=nrDataSource)
	try:
		print(df)
		if('2bar' == plotType):
			c = doPlot2(data=df, nrDataSource=nrDataSource)
		elif('bar' == plotType):
			c = doPlot1(data=df, nrDataSource=nrDataSource)
		elif('bar_log' == plotType):
			c = doPlot1log(data=df, nrDataSource=nrDataSource)
		elif('line' == plotType):
			c = doPlot11(data=df, nrDataSource=nrDataSource)
		elif('box' == plotType):
			c = doPlot_Box(data=df, nrDataSource=nrDataSource)
		elif('stackedBar' == plotType):
			c = doPlot_stackedBar(data=df, nrDataSource=nrDataSource)
		elif('area' == plotType):
			c = doPlot_Area(data=df, nrDataSource=nrDataSource)
		else:
			return Response("Plot type unknown", status=500)
		return Response(json.dumps(c), mimetype="application/json")
	except Exception as e:
		log.exception("plotting error:")
		raise HttpError("the Node-RED result could not be plotted. Maybe wrong data format for the plot type? Check result table: {}".format(str(e)), 500)




@app.route("/api_analytics/nrendpoint", methods=["GET"])
def getNodeRedEndpoint():
	e = {"url":appConfig.nodered_url}
	return Response(json.dumps(e), mimetype="application/json")




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
