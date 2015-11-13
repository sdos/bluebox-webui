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

import json, logging, os, time, datetime

from flask import Flask, request, Response, send_file
from werkzeug import secure_filename

from exceptions import HttpError
from SwiftConnect import SwiftConnect
import appConfig


# initialize logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s')
log = logging.getLogger()

# Initialize the Flask application
# app = Flask(__name__)
app = Flask(__name__, static_folder='angular')

# Instantiating SwiftClient
swift = SwiftConnect(appConfig.swift_type, appConfig.swift_url, appConfig.swift_user, appConfig.swift_pw)



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
@app.route('/')
@app.route('/<path:path>')
def index(path = ""):
	if path[:5] != "swift":
		# return render_template('index.html')
		return send_file('angular/index.html')

##############################################################################

"""
	get the list of containers
"""
@app.route('/swift/containers', methods=['GET'])
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
	j = json.dumps(cts,sort_keys=True)
	return Response(j, mimetype='application/json')

##############################################################################

"""
	create the Container
"""
@app.route('/swift/containers', methods=['POST'])
def create():
	folderName = request.form['containerName']
	print(folderName)
	swift.create_container(folderName)
	return Response(None)

##############################################################################

"""
	get the list of all objects in a container
"""
@app.route('/swift/containers/<containerName>/objects', methods=['GET'])
def get_objects_in_container(containerName):
	log.debug("getObjectsInContainer")
	log.debug(containerName)
	
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
	
	cts = swift.get_object_list(containerName, **optional_params)
	f = json.dumps(cts, sort_keys=True)
	return Response(f, mimetype='application/json')

##############################################################################

"""
	get the list of metadata information of all objects in a container
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>/details', methods=['GET'])
def get_metadata_info(containerName,filename):
	log.debug("Get metadata information")
	log.debug(containerName)
	log.debug(filename)
	metaInfo = swift.get_object_metadata(containerName, filename)
	metadata = json.dumps(metaInfo, sort_keys=True)
	return Response(metadata, mimetype='application/json')

##############################################################################

"""
	Route that will process the file upload
"""
@app.route('/swift/containers/<containerName>/objects', methods=['POST'])
def upload(containerName):
	# Get the name of the uploaded file
	log.debug("inside the upload part")
	inputFile = request.files['objectName']
	# Check if the file is one of the allowed types/extensions
	if inputFile:
		log.debug("accepted file upload")
		# Make the filename safe, remove unsupported chars
		inputFileName = secure_filename(inputFile.filename)
		log.debug(inputFileName)
		inputFileContent = inputFile.read()
		log.debug(inputFileContent)
		log.debug(containerName)
		retentime =  request.form['RetentionPeriod']
		log.debug(retentime)
		if retentime:
			convertretentime = datetime.datetime.strptime(retentime,"%Y-%m-%d").strftime("%d-%m-%Y")
			log.debug(convertretentime)
			retentimestamp = int(time.mktime(datetime.datetime.strptime(convertretentime, "%d-%m-%Y").timetuple()))
			log.debug(retentimestamp)
		else:
			retentimestamp = retentime
		h = dict()
		h["X-Object-Meta-RetentionTime"] = retentimestamp
		h["X-Object-Meta-OwnerName"] = request.form['OwnerName']
		swift.create_object(inputFileName, inputFileContent, containerName, h)
	return Response(None)

##############################################################################		
		
"""
	download obj route
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>', methods=['GET'])
def download_object(containerName, filename):
		log.debug("downloadObject: %s - %s" % (containerName, filename))
		encodedOutputFile = swift.get_object(containerName, filename)
		return Response(encodedOutputFile, mimetype='application/octet-stream')

def calcTimeDifference(timestamp):
	try:
		return int(timestamp) - int(time.time())
	except ValueError:
		return False

def isRetentionPeriodExpired(timestamp):
	if (calcTimeDifference(timestamp)):
		return calcTimeDifference(timestamp) <= 0
	return False

##############################################################################

"""
	delete obj route
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>', methods=['DELETE'])
def delete_object(containerName, filename):
		log.debug("deleteObject: %s - %s" % (containerName, filename))
		json1 = json.dumps(swift.get_object_metadata(containerName, filename),ensure_ascii=False)
		log.debug(json1)
		new_dict = json.loads(json1)
		retentimestamp = new_dict['x-object-meta-retentiontime']
		if (isRetentionPeriodExpired(retentimestamp) or not retentimestamp):
			swift.delete_object(containerName,filename)
			responsemsg={}
			responsemsg['deletestatus'] = "done"
			return Response(json.dumps(responsemsg), mimetype='application/json')
		else:
			log.debug("You are not allowed to delete the file!")
			log.debug( "The retentiondate is: " +
				    datetime.datetime.fromtimestamp(
				        int(retentimestamp)
				    ).strftime('%m-%d-%Y')
				)
			minutes, seconds = divmod(calcTimeDifference(retentimestamp), 60)
			hours, minutes = divmod(minutes, 60)
			days, hours = divmod(hours, 24)
			weeks, days = divmod(days, 7)
			log.debug("The number of days left for deletion: " + str(days))	
			log.debug("You should wait for "+ str(weeks)+" weeks and "+ str(days)+" days and "+str(hours)+" hours and "+str(minutes)+" minutes and"+str(seconds)+" seconds to delete this file!!!")
			responsemsg={}
			responsemsg['deletestatus'] = "failed"
			responsemsg['retention'] = datetime.datetime.fromtimestamp(int(retentimestamp)).strftime('%m-%d-%Y')
			responsemsg['seconds'] = seconds
			responsemsg['minutes'] = minutes
			responsemsg['hours'] = hours
			responsemsg['days'] = days
			responsemsg['weeks'] = weeks
			return Response(json.dumps(responsemsg), mimetype='application/json')

##############################################################################

# TODO scheduler
# TODO what should we do about the files which have no retention date
@app.route('/swift/containers/<containerName>/CheckOldFiles/', methods=['GET'])
def check_old_files(containerName, doDelete=False):
	log.debug(containerName)
	files = swift.get_object_list(containerName)
	oldFiles={}
	filenames = list()
	for file in files:
		log.debug('{0}\t{1}\t{2}'.format(file['name'], file['bytes'], file['last_modified']))
		fileMetaDict = swift.get_object_metadata(containerName,file['name'])
		log.debug(fileMetaDict)
		log.debug(file['name'])
		log.debug(fileMetaDict['x-object-meta-retentiontime'])
		retentimestamp = fileMetaDict['x-object-meta-retentiontime']
		
		if (isRetentionPeriodExpired(retentimestamp)):
			filenames.append(file['name'])

				
	log.debug(filenames)	
	responseObj = {"list" : filenames}
	if (doDelete):
		swift.delete_objects(containerName,filenames)
	return Response(json.dumps(responseObj), mimetype='application/json') 

##############################################################################

@app.route('/swift/containers/<containerName>/DeleteOldFiles/', methods=['Delete'])
def delete_old_files(containerName):
	return check_old_files(containerName, doDelete=True)



##############################################################################
# views
##############################################################################  

if __name__ == '__main__':
	appPort = os.getenv('VCAP_APP_PORT', '5000')
	appHost = os.getenv('VCAP_APP_HOST', '127.0.0.1')
	app.run(
		host=appHost,
		port=int(appPort),
		debug=True
	)