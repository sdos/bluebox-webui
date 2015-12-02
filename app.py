"""
    Project Bluebox
    2015, University of Stuttgart, IPVS/AS
"""
"""
    Project Bluebox

    Copyright (C) <2015> <University of Stuttgart>

    This software may be modified and distributed under the terms
    of the MIT license.  See the LICENSE file for details.
"""
# initialize logging

from functools import wraps
from datetime import datetime
import json, logging, os, time
import sys

from flask import Flask, request, Response, send_file
from werkzeug import secure_filename
from swiftclient.exceptions import ClientException

from exceptions import HttpError
from SwiftConnect import SwiftConnect
import appConfig


logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s")
log = logging.getLogger()

# Initialize the Flask application
# app = Flask(__name__)
app = Flask(__name__, static_folder="angular")

# Instantiating SwiftClient
swift = SwiftConnect(appConfig.swift_type, appConfig.swift_url, appConfig.swift_user, appConfig.swift_pw)



##############################################################################
# decorators
##############################################################################

def log_requests(func):
    @wraps(func)
    def logging_wrapper(*args, **kwargs):
        log.debug("request: {} {} handled by function: {}".format(request.method, request.url, func.__name__))
        return func(*args, **kwargs)
    return logging_wrapper



##############################################################################
# error handler
##############################################################################

@app.errorhandler(HttpError)
def handle_invalid_usage(error):
    response = error.to_json()
    response.status_code = error.status_code
    return response



##############################################################################
# views
##############################################################################

"""
    This route will show a form to perform an AJAX request
    jQuery is loaded to execute the request and update the
    value of the operation
"""
@app.route("/")
@app.route("/<path:path>")
def index(path=""):
    if path[:5] != "swift":
        # return render_template('index.html')
        return send_file("angular/index.html")

##############################################################################

"""
    get the list of containers
"""
@app.route("/swift/containers", methods=["GET"])
@log_requests
def get_containers():
    optional_params = {}

    limit = request.args.get("limit")
    if limit is not None:
        if limit.isdigit() and int(limit) > 0:
            optional_params["limit"] = int(limit)
        else:
            log.debug("invalid query parameter limit: {}, for request: {}".format(limit, request.url))
            raise HttpError("specified query parameter limit: {}, must be a positive integer".format(limit), 400)

    marker = request.args.get("marker")
    if marker is not None:
        optional_params["marker"] = marker

    prefix = request.args.get("prefix")
    if prefix is not None:
        optional_params["prefix"] = prefix

    cts = swift.get_container_list(**optional_params)

    resp = {}
    resp["metadata"] = {"containerCount": cts[0].get("x-account-container-count"),
                        "objectCount": cts[0].get("x-account-object-count")}
    resp["containers"] = cts[1]
    return Response(json.dumps(resp, sort_keys=True), mimetype="application/json")

##############################################################################

"""
    create a container
"""
@app.route("/swift/containers", methods=["POST"])
@log_requests
def create_container():
    container_name = request.form["containerName"]
    swift.create_container(container_name)
    return Response(None)

##############################################################################

"""
    delete a container
"""
@app.route("/swift/containers/<container_name>", methods=["DELETE"])
@log_requests
def delete_container(container_name):
    swift.delete_container(container_name)
    return Response(None)

##############################################################################


"""
    get the list of all objects in a container
"""
@app.route("/swift/containers/<container_name>/objects", methods=["GET"])
@log_requests
def get_objects_in_container(container_name):
    optional_params = {}

    limit = request.args.get("limit")
    if limit is not None:
        if limit.isdigit() and int(limit) > 0:
            optional_params["limit"] = int(limit)
        else:
            log.debug("invalid query parameter limit: {}, for request: {}".format(limit, request.url))
            raise HttpError("specified query parameter limit: {}, must be a positive integer".format(limit), 400)

    marker = request.args.get("marker")
    if marker is not None:
        optional_params["marker"] = marker

    prefix = request.args.get("prefix")
    if prefix is not None:
        optional_params["prefix"] = prefix

    cts = swift.get_object_list(container_name, **optional_params)
    print(cts[0])
    resp = {}
    resp["metadata"] = {"schema": "NOT IMPLEMENTED YET",
                        "objectCount": cts[0].get("x-container-object-count")}
    resp["objects"] = cts[1]
    return Response(json.dumps(resp, sort_keys=True), mimetype="application/json")

##############################################################################

"""
    get the meta data of the specified object as json
"""
@app.route("/swift/containers/<container_name>/objects/<path:object_name>/details", methods=["GET"])
@log_requests
def get_object_metadata(container_name, object_name):
    metadata = swift.get_object_metadata(container_name, object_name)
    as_json = json.dumps(metadata, sort_keys=True)
    return Response(as_json, mimetype="application/json")

##############################################################################

"""
    Route that will process the file upload
"""
@app.route("/swift/containers/<container_name>/objects", methods=["POST"])
@log_requests
def upload_object(container_name):
    # Get the name of the uploaded file
    file = request.files["objectName"]  # returns werkzeug.datastructures.FileStorage i.e. file-like.
                                        # Underlying stream is either BytesIO for small files or _TemporaryFileWrapper for large files
    object_name = secure_filename(file.filename)
    retentime = request.form["RetentionPeriod"]
    
    headers = dict()
    if retentime:
        try:
            converted_retentime = datetime.strptime(retentime, "%Y-%m-%d")
            reten_timestamp = int(time.mktime(converted_retentime.timetuple()))
            headers["X-Object-Meta-RetentionTime"] = reten_timestamp
        except ValueError as e:
            log.debug("invalid date format for form parameter RetentionPeriod: {}, for request: {}. Expected format: yyyy-mm-dd".format(retentime))
            raise HttpError("invalid date format for form parameter RetentionPeriod: {}. Expected format: yyyy-mm-dd".format(retentime), 400)
    headers["X-Object-Meta-OwnerName"] = request.form["OwnerName"]

    swift.streaming_object_upload(object_name, container_name, file, headers)
    return Response(None)

##############################################################################

@app.route("/swift/containers/<container_name>/objects/<path:object_name>", methods=["GET"])
@log_requests
def stream_object(container_name, object_name):
    obj_tupel = swift.get_object_as_generator(container_name, object_name)
    headers = {"Content-Length": obj_tupel[0].get("content-length")}
    return Response(obj_tupel[1], mimetype="application/octet-stream", headers=headers)

##############################################################################

"""
    delete the specified object
"""
@app.route("/swift/containers/<container_name>/objects/<path:object_name>", methods=["DELETE"])
@log_requests
def delete_object(container_name, object_name):
        json1 = json.dumps(swift.get_object_metadata(container_name, object_name), ensure_ascii=False)
        log.debug(json1)
        new_dict = json.loads(json1)
        retentimestamp = new_dict["x-object-meta-retentiontime"]
        if (isRetentionPeriodExpired(retentimestamp) or not retentimestamp):
            swift.delete_object(container_name,object_name)
            responsemsg={}
            responsemsg["deletestatus"] = "done"
            return Response(json.dumps(responsemsg), mimetype="application/json")
        else:
            log.debug("You are not allowed to delete the file!")
            log.debug( "The retentiondate is: " +
                    datetime.fromtimestamp(
                        int(retentimestamp)
                    ).strftime("%m-%d-%Y")
                )
            minutes, seconds = divmod(calcTimeDifference(retentimestamp), 60)
            hours, minutes = divmod(minutes, 60)
            days, hours = divmod(hours, 24)
            weeks, days = divmod(days, 7)
            log.debug("The number of days left for deletion: " + str(days))    
            log.debug("You should wait for "+ str(weeks)+" weeks and "+ str(days)+" days and "+str(hours)+" hours and "+str(minutes)+" minutes and"+str(seconds)+" seconds to delete this file!!!")
            responsemsg={}
            responsemsg["deletestatus"] = "failed"
            responsemsg["retention"] = datetime.fromtimestamp(int(retentimestamp)).strftime("%m-%d-%Y")
            responsemsg["seconds"] = seconds
            responsemsg["minutes"] = minutes
            responsemsg["hours"] = hours
            responsemsg["days"] = days
            responsemsg["weeks"] = weeks
            return Response(json.dumps(responsemsg), mimetype="application/json")

##############################################################################

# TODO scheduler
# TODO what should we do about the files which have no retention date
@app.route("/swift/containers/<containerName>/CheckOldFiles/", methods=["GET"])
@log_requests
def check_old_files(containerName, doDelete=False):
    log.debug(containerName)
    files = swift.get_object_list(containerName)
    oldFiles = {}
    filenames = list()
    for file in files:
        log.debug("{0}\t{1}\t{2}".format(file["name"], file["bytes"], file["last_modified"]))
        fileMetaDict = swift.get_object_metadata(containerName, file["name"])
        log.debug(fileMetaDict)
        log.debug(file["name"])
        log.debug(fileMetaDict["x-object-meta-retentiontime"])
        retentimestamp = fileMetaDict["x-object-meta-retentiontime"]

        if (isRetentionPeriodExpired(retentimestamp)):
            filenames.append(file["name"])


    log.debug(filenames)
    responseObj = {"list": filenames}
    if (doDelete):
        swift.delete_objects(containerName, filenames)
    return Response(json.dumps(responseObj), mimetype="application/json")

##############################################################################

@app.route("/swift/containers/<containerName>/DeleteOldFiles/", methods=["DELETE"])
@log_requests
def delete_old_files(containerName):
    return check_old_files(containerName, doDelete=True)



##############################################################################
# helper functions
##############################################################################

def calcTimeDifference(timestamp):
    try:
        return int(timestamp) - int(time.time())
    except ValueError:
        return False

##############################################################################

def isRetentionPeriodExpired(timestamp):
    if (calcTimeDifference(timestamp)):
        return calcTimeDifference(timestamp) <= 0
    return False

##############################################################################
# main
##############################################################################

if __name__ == "__main__":
    appPort = os.getenv("VCAP_APP_PORT", "5000")
    appHost = os.getenv("VCAP_APP_HOST", "127.0.0.1")
    app.run(
        host=appHost,
        port=int(appPort),
        debug=True
    )