# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import json
import logging

from flask import Response

from mcm.Bluebox import app, metadataFieldDefinitions

log = logging.getLogger()

"""

Get all the filter definitions once

"""

mapping = dict()
# image filters
mapping[metadataFieldDefinitions.ImportFilterBmp.myName] = metadataFieldDefinitions.ImportFilterBmp
mapping[metadataFieldDefinitions.ImportFilterGif.myName] = metadataFieldDefinitions.ImportFilterGif
mapping[metadataFieldDefinitions.ImportFilterJpeg.myName] = metadataFieldDefinitions.ImportFilterJpeg
mapping[metadataFieldDefinitions.ImportFilterPng.myName] = metadataFieldDefinitions.ImportFilterPng
mapping[metadataFieldDefinitions.ImportFilterTiff.myName] = metadataFieldDefinitions.ImportFilterTiff

# document filters
mapping[metadataFieldDefinitions.ImportFilterEmail.myName] = metadataFieldDefinitions.ImportFilterEmail
mapping[metadataFieldDefinitions.ImportFilterPDF.myName] = metadataFieldDefinitions.ImportFilterPDF

f = dict()

for key in mapping:
    f[key] = mapping[key].myValidTagNames

"""

HTTP-API endpoints

"""


@app.route("/api_metadata/filterFields", methods=["GET"])
def getFilterFields():
    return Response(json.dumps(f), mimetype="application/json")
