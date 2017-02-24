# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import collections
import json
import logging
from io import StringIO
from urllib import parse as urlParse

import pandas
from pandas.indexes.range import RangeIndex
import psycopg2
import requests
from bokeh.plotting import figure
from bokeh.charts import Area, vplot, Bar, Line, BoxPlot
from bokeh.embed import components
from bokeh.models import ColumnDataSource, TickFormatter
from bokeh.properties import Dict, Int, String, Auto
from bokeh.palettes import small_palettes
from bokeh.util.compiler import CoffeeScript
from bokeh.resources import EMPTY
from flask import request, Response

from mcm.Bluebox import app, accountServer
from mcm.Bluebox import configuration
from mcm.Bluebox.exceptions import HttpError


###############################################################################
# HTTP API
###############################################################################
@app.route("/api_analytics/table", methods=["GET"])
def doTable():
    accountServer.assert_token_tenant_validity(request)
    nrDataSource = json.loads(urlParse.unquote(request.args.get("nrDataSource")))
    logging.info("producing table for: {}".format(nrDataSource))
    data = getDataFromNodeRed(nrDataSource=nrDataSource)
    # log.debug("our pandas data frame is: {}".format(data.to_json(orient="records")))
    info = StringIO()
    data.info(verbose=False, buf=info)
    r = {
        "table": data[:50].to_json(orient="records"),
        "info": info.getvalue(),
        "truncated": (len(data) > 50)
    }
    # print(r)
    return Response(json.dumps(r), mimetype="application/json")


@app.route("/api_analytics/plot", methods=["GET"])
def doPlot():
    accountServer.assert_token_tenant_validity(request)
    nrDataSource = json.loads(urlParse.unquote(request.args.get("nrDataSource")))
    plotType = request.args.get("plotType")
    logging.info("producing plot: {} for: {}".format(plotType, nrDataSource))

    df = getDataFromNodeRed(nrDataSource=nrDataSource)
    try:
        logging.info(df)
        if ('bar' == plotType):
            c = bokeh_plot_bar(data=df, nrDataSource=nrDataSource)
        elif ('bar_log' == plotType):
            c = bokeh_plot_bar(data=df, nrDataSource=nrDataSource, logScale="log")
        elif ('line' == plotType):
            c = bokeh_plot_line(data=df, nrDataSource=nrDataSource)
        elif ('line_log' == plotType):
            c = bokeh_plot_line(data=df, nrDataSource=nrDataSource, logScale="log")
        elif ('pie' == plotType):
            c = bokeh_plot_pie(data=df, nrDataSource=nrDataSource)
        else:
            return Response("Plot type unknown", status=500)
        return Response(json.dumps(c), mimetype="application/json")
    except Exception as e:
        logging.exception("plotting error:")
        raise HttpError(
            "the Node-RED result could not be plotted. Maybe wrong data format for the plot type? Check result table: {}".format(
                str(e)), 500)


@app.route("/api_analytics/nrsources", methods=["GET"])
def getNodeRedEnpointList():
    accountServer.assert_token_tenant_validity(request)
    n = requests.get(configuration.nodered_url + "/flows").json()
    sources = []
    for s in n:
        # Node-RED has a strange API... we can't reconstruct node/flow relationships...
        # if ('tab' == s['type'] and 'label' in s):
        # 	thisFlowName = s['label'] + "->"
        if ('http in' == s['type'] and 'url' in s):
            sources.append({"url": s['url'], "name": s['name']})
    return Response(json.dumps(sources), mimetype="application/json")


###############################################################################
# bokeh support functions
###############################################################################
class FixedTickFormatter(TickFormatter):
    """
    Class used to allow custom axis tick labels on a bokeh chart
    Extends bokeh.model.formatters.TickFormatter
    """
    labels = Dict(Int, String, help="""
            A mapping of integer ticks values to their labels.
            """)
    COFFEESCRIPT = """
        import {_} from "underscore"
        import {Model} from "model"
        import * as p from "core/properties"
        export class FixedTickFormatter extends Model
          type: 'FixedTickFormatter'
          @define {
            labels: [ p.Any ]
          }
          doFormat: (ticks) ->
                labels = @labels
                return (labels[tick] ? "" for tick in ticks)
    """

    __implementation__ = CoffeeScript(COFFEESCRIPT)


def __col_to_label_dict(col, offset=1):
    r = dict()
    for k, v in dict(col).items():
        r[(int(k) * offset)] = v
    return r


###############################################################################
# Plots
###############################################################################

###############################################################################
# WORKING
###############################################################################
def bokeh_plot_line(data, nrDataSource, logScale="linear"):
    title = "Line graph: " + nrDataSource['name']
    value_col_names = [d for d in data.columns[1:]]
    # print(data)

    # small_palettes only works with 2+ items; so we increase size by two
    #   and later reduce back down
    colors = small_palettes['Dark2'][len(value_col_names) + 2]
    colors = colors[:len(value_col_names)]

    plot = figure(plot_width=1000, plot_height=600, y_axis_type=logScale)
    plot.title.text = title
    plot.yaxis.axis_label = "values"
    plot.xaxis.axis_label = data.columns[0]

    for (col_name, color) in zip(value_col_names, colors):
        plot.line(data.index, data[col_name], name=col_name, legend=col_name, color=color, line_width=3)

    plot.xaxis[0].formatter = FixedTickFormatter(labels=__col_to_label_dict(data[data.columns[0]]))

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)

    js = EMPTY.js_raw[0] + script

    return (js, div)


def bokeh_plot_bar(data, nrDataSource, logScale="linear"):
    title = "Bar graph: " + nrDataSource['name']
    value_col_names = [d for d in data.columns[1:]]
    # print(data)

    # small_palettes only works with 2+ items; so we increase size by two
    #   and later reduce back down
    colors = small_palettes['Dark2'][len(value_col_names) + 2]
    colors = colors[:len(value_col_names)]

    plot = figure(plot_width=1000, plot_height=600, y_axis_type=logScale)
    plot.title.text = title
    plot.yaxis.axis_label = "values"
    plot.xaxis.axis_label = data.columns[0]

    num_series = len(value_col_names)
    for (col_name, color, idx) in zip(value_col_names, colors, range(0, num_series)):
        this_index = RangeIndex(start=idx, stop=len(data.index) * num_series, step=num_series)
        print(data[col_name])
        print(col_name)
        print(this_index)
        plot.vbar(x=this_index, width=0.5, top=data[col_name], name=col_name, legend=col_name, color=color)

    print(__col_to_label_dict(data[data.columns[0]], offset=num_series))
    plot.xaxis[0].formatter = FixedTickFormatter(labels=__col_to_label_dict(data[data.columns[0]], offset=num_series))

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)

    js = EMPTY.js_raw[0] + script

    return (js, div)

def bokeh_plot_pie(data, nrDataSource):
    title = "Pie chart: " + nrDataSource['name']
    value_col_names = [d for d in data.columns[1:]]
    # print(data)

    # small_palettes only works with 2+ items; so we increase size by two
    #   and later reduce back down
    colors = small_palettes['Dark2'][len(value_col_names) + 2]
    colors = colors[:len(value_col_names)]

    plot = figure(plot_width=1000, plot_height=600)
    plot.title.text = title
    plot.yaxis.axis_label = "values"
    plot.xaxis.axis_label = data.columns[0]

    num_series = len(value_col_names)
    for (col_name, color, idx) in zip(value_col_names, colors, range(0, num_series)):
        this_index = RangeIndex(start=idx, stop=len(data.index) * num_series, step=num_series)
        print(data[col_name])
        print(col_name)
        print(this_index)
        plot.vbar(x=this_index, width=0.5, top=data[col_name], name=col_name, legend=col_name, color=color)

    print(__col_to_label_dict(data[data.columns[0]], offset=num_series))
    plot.xaxis[0].formatter = FixedTickFormatter(labels=__col_to_label_dict(data[data.columns[0]], offset=num_series))

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)

    js = EMPTY.js_raw[0] + script

    return (js, div)


###############################################################################
# nodered integration
###############################################################################

def getListOfKeys(d):
    keys = []
    for k in d.keys():
        keys.append(k)
    return keys


def getDataFromNodeRed(nrDataSource):
    url = configuration.nodered_url + nrDataSource['url']
    logging.info("getting data from node red at: {}".format(url))
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
        logging.exception("JSON parse error:")
        raise HttpError("the Node-RED result is no valid JSON", 500)


###############################################################################
# Database connection
###############################################################################
def __get_db_connection_for_tenant(tenant):
    d = configuration.metadata_warehouse_endpoint.copy()
    d["database"] = d["database"].format(tenant)
    return d


@app.route("/api_analytics/tablestructure", methods=["GET"])
def getTableStructure():
    # check if user is logged in
    t = accountServer.get_and_assert_tenant_from_request(request)
    d = __get_db_connection_for_tenant(t)
    # Establish connection to PostgreSQL database
    # conn = sqlite3.connect("/tmp/metadata.sqlite") #SQLITE
    with psycopg2.connect(**d) as conn:
        with conn.cursor() as cursor:
            # Retrieve all table names
            # cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC") #SQLITE
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema=%s;", ("public",))
            tableNames = cursor.fetchall()

            tableData = {}

            # Retrieve the column names and first 5 rows for each table
            for table in tableNames:
                # cursor.execute("PRAGMA table_info(" + table[0] + ")") #SQLITE
                cursor.execute("SELECT column_name,data_type FROM information_schema.columns WHERE table_name = %s;",
                               (table[0],))
                columnNames = cursor.fetchall()

                # cursor.execute("SELECT * FROM " + table[0] + " LIMIT 5") #SQLITE
                cursor.execute("SELECT * FROM {} LIMIT 5".format(table[0]))
                rowEntries = cursor.fetchall()

                # Dictionary which combines column names and row entries
                columnStructure = {}

                # format the column names and types
                columnList = ["{} ({})".format(c[0], c[1]) for c in columnNames]

                # Populate final dictionary table Data
                columnStructure['columnNames'] = columnList
                columnStructure['rowEntries'] = rowEntries
                tableData[table[0]] = columnStructure

            return Response(json.dumps(tableData), mimetype="application/json")
