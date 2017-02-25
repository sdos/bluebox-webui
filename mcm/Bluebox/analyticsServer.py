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
from math import pi
from urllib import parse as urlParse

import pandas
import psycopg2
import requests
from bokeh.embed import components
from bokeh.models import TickFormatter, LabelSet, ColumnDataSource
from bokeh import palettes
from bokeh.plotting import figure
from bokeh.charts import Donut

from bokeh.properties import Dict, Int, String
from bokeh.resources import EMPTY
from bokeh.util.compiler import CoffeeScript
from flask import request, Response
from pandas.indexes.range import RangeIndex

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
    container_filter = __safe_get_nested_json_prop(request.args)
    logging.info("producing table for: {}".format(nrDataSource))
    data = getDataFromNodeRed(nrDataSource=nrDataSource, container_filter=container_filter)
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
    container_filter = __safe_get_nested_json_prop(request.args)
    logging.info("producing plot: {} for: {}".format(plotType, nrDataSource))

    df = getDataFromNodeRed(nrDataSource=nrDataSource, container_filter=container_filter)
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
                e), 500)


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


def __safe_get_nested_json_prop(request_args):
    try:
        __filter_prop = urlParse.unquote(request_args.get("container_filter", None))
        return json.loads(__filter_prop).get("name", None) if __filter_prop else None
    except AttributeError:
        return
    except TypeError:
        return


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


def __get_color_palette(length):
    # print("__get_color_palette", length)
    """
    see
    http://bokeh.pydata.org/en/latest/docs/reference/palettes.html
    """
    if length <= 8 - 2:
        # small_palettes only works with 2+ items; so we increase size by two
        #   and later reduce back down
        colors = palettes.Colorblind[length + 2]
        return colors[:length]
    else:
        return palettes.viridis(length)


###############################################################################
# Plots
###############################################################################
def bokeh_plot_line(data, nrDataSource, logScale="linear"):
    title = "Line graph: " + nrDataSource['name']
    value_col_names = [d for d in data.columns[1:]]
    # print(data)

    plot = figure(plot_width=1200, plot_height=600, y_axis_type=logScale, responsive=True)
    plot.title.text = title
    plot.yaxis.axis_label = value_col_names[0] if len(value_col_names) == 1 else "values"
    plot.xaxis.axis_label = data.columns[0]

    for (col_name, color) in zip(value_col_names, __get_color_palette(len(value_col_names))):
        plot.line(data.index, data[col_name], name=col_name, legend=col_name, color=color, line_width=3)

    plot.xaxis[0].formatter = FixedTickFormatter(labels=__col_to_label_dict(data[data.columns[0]]))
    plot.xaxis[0].ticker.desired_num_ticks = len(data[data.columns[0]])
    plot.xaxis[0].major_label_orientation = pi / 4

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)
    js = EMPTY.js_raw[0] + script

    return (js, div)


def bokeh_plot_bar(data, nrDataSource, logScale="linear"):
    title = "Bar graph: " + nrDataSource['name']
    value_col_names = [d for d in data.columns[1:]]
    # print(data)

    plot = figure(plot_width=1200, plot_height=600, y_axis_type=logScale, responsive=True)
    plot.title.text = title
    plot.yaxis.axis_label = value_col_names[0] if len(value_col_names) == 1 else "values"
    plot.xaxis.axis_label = data.columns[0]

    num_series = len(value_col_names)
    max_idx = len(data.index) * (num_series + 1)
    for (col_name, color, idx) in zip(value_col_names, __get_color_palette(len(value_col_names)), range(0, num_series)):
        this_index = RangeIndex(start=idx, stop=max_idx, step=num_series + 1)
        plot.vbar(x=this_index, width=0.8, top=data[col_name], name=col_name, legend=col_name, color=color)
        #s=ColumnDataSource(data)
        #labels = LabelSet(x=list(this_index), y=col_name, text=col_name, y_offset=8, source=s,text_font_size="8pt", text_color="#555555", text_align='center')
        #plot.add_layout(labels)

    plot.xaxis[0].formatter = FixedTickFormatter(
        labels=__col_to_label_dict(data[data.columns[0]], offset=num_series + 1))
    plot.xaxis[0].ticker.desired_num_ticks = max_idx
    plot.xaxis[0].major_label_orientation = pi / 4

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)
    js = EMPTY.js_raw[0] + script

    return (js, div)


def bokeh_plot_pie(data, nrDataSource):
    value_col_names = [d for d in data.columns[1:]]
    num_rows = len(data[data.columns[0]])

    plot = Donut(data, values=value_col_names[0], label=data.columns[0],
                 text_font_size='8pt', plot_width=800,
                 plot_height=800, responsive=True)  # , color=__get_color_palette(num_rows)) #default palette looks best

    script, div = components(plot, resources=None, wrap_script=False, wrap_plot_info=True)
    return (script, div)


###############################################################################
# nodered integration
###############################################################################
def getListOfKeys(d):
    keys = []
    for k in d.keys():
        keys.append(k)
    return keys


def getDataFromNodeRed(nrDataSource, container_filter=None):
    url = configuration.nodered_url + nrDataSource['url']
    params = {"container_filter": container_filter}
    logging.info("getting data from node red at: {} with params: {}".format(url, params))
    r = requests.get(url, params=params)
    if r.status_code == 404:
        raise HttpError("the Node-RED data source is not reachable: {}".format(url), 420)
    try:
        data = json.JSONDecoder(object_pairs_hook=collections.OrderedDict).decode(r.content.decode())
        dataKeys = getListOfKeys(data[0])
        df = pandas.DataFrame(data, columns=dataKeys)
        df[dataKeys[0]] = df[dataKeys[0]].map(lambda x: str(x)[:20])
        return df
    except IndexError as e:
        logging.warning("no data returned {}".format(e))
        raise HttpError("query returned no data", 404)
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
