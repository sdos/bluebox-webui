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

from flask import Flask, render_template, request, Response
from werkzeug import secure_filename
from SwiftConnect import SwiftConnect
import json, logging, os, time, datetime
import appConfig


# initialize logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s')
log = logging.getLogger()

# Initialize the Flask application
app = Flask(__name__)

# Instantiating SwiftClient
swift = SwiftConnect(appConfig.swift_type, appConfig.swift_url, appConfig.swift_user, appConfig.swift_pw)

##########################################################################################
"""
	This route will show a form to perform an AJAX request
	jQuery is loaded to execute the request and update the
	value of the operation
"""
@app.route('/')
def index():
	return render_template('index.html')

##########################################################################################
"""
	get the list of containers
"""
@app.route('/swift/containers', methods=['GET'])
def getContainers():
	cts = swift.containerList()
	j = json.dumps(cts,sort_keys=True)
	return Response(j, mimetype='application/json')
##########################################################################################
"""
	create the Container
"""

@app.route('/create', methods=['POST'])
def create():
	folderName = request.form['containerName']
	print(folderName)
	swift.createContainer(folderName)
	return Response(None)

##########################################################################################
"""
	get the list of all objects in a container
"""
@app.route('/swift/containers/<containerName>/objects', methods=['GET'])
def getObjectsInContainer(containerName):
	log.debug("getObjectsInContainer")
	log.debug(containerName)
	cts = swift.fileList(containerName)
	f = json.dumps(cts,sort_keys=True)
	return Response(f, mimetype='application/json')

##########################################################################################
"""
	get the list of metadata information of all objects in a container
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>/details', methods=['GET'])
def getMetaDataInfo(containerName,filename):
	log.debug("Get metadata information")
	log.debug(containerName)
	log.debug(filename)
	metaInfo = swift.getObjMetaData(containerName,filename)
	metadata = json.dumps(metaInfo,sort_keys=True)
	return Response(metadata, mimetype='application/json')


##########################################################################################

"""
	Route that will process the file upload
"""
@app.route('/upload', methods=['POST'])
def upload():
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
		folderName = request.form['containerNameUp']
		log.debug(folderName)
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
		swift.createObject(inputFileName,inputFileContent,folderName,h)
		encodedoutputFileContent = swift.retrieveObject(folderName,inputFileName)
	return Response(None)
			
		
##########################################################################################
"""
	download obj route
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>', methods=['GET'])
def downloadObject(containerName, filename):
		log.debug("downloadObject: %s - %s" % (containerName, filename))
		encodedOutputFile = swift.getObject(containerName,filename)
		return Response(encodedOutputFile, mimetype='application/octet-stream')
##########################################################################################
def calcTimeDifference(timestamp):
	try:
		return int(timestamp) - int(time.time())
	except ValueError:
		return False

def isRetentionPeriodExpired(timestamp):
	if (calcTimeDifference(timestamp)):
		return calcTimeDifference(timestamp) <= 0
	return False

"""
	delete obj route
"""
@app.route('/swift/containers/<containerName>/objects/<path:filename>', methods=['DELETE'])
def deleteObject(containerName,filename):
		log.debug("deleteObject: %s - %s" % (containerName, filename))
		json1 = json.dumps(swift.getObjMetaData(containerName,filename),ensure_ascii=False)
		log.debug(json1)
		new_dict = json.loads(json1)
		retentimestamp = new_dict['x-object-meta-retentiontime']
		if (isRetentionPeriodExpired(retentimestamp) or not retentimestamp):
			swift.delObject(containerName,filename)
			responsemsg={}
			responsemsg['deletestatus'] = "done"
			return Response(json.dumps(responsemsg),mimetype='application/json')
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
			return Response(json.dumps(responsemsg),mimetype='application/json')
	
#################################Scheduler#########################################################
@app.route('/swift/containers/<containerName>/CheckOldFiles/', methods=['GET'])
def CheckOldFiles(containerName, doDelete=False):
	log.debug(containerName)
	files = swift.fileList(containerName)
	oldFiles={}
	filenames = list()
	for file in files:
		log.debug('{0}\t{1}\t{2}'.format(file['name'], file['bytes'], file['last_modified']))
		fileMetaDict = swift.getObjMetaData(containerName,file['name'])
		log.debug(fileMetaDict)
		log.debug(file['name'])
		log.debug(fileMetaDict['x-object-meta-retentiontime'])
		retentimestamp = fileMetaDict['x-object-meta-retentiontime']
		
		if (isRetentionPeriodExpired(retentimestamp)):
			filenames.append(file['name'])

				
	log.debug(filenames)	
	responseObj = {"list" : filenames}
	if (doDelete):
		swift.delObjects(containerName,filenames)
	return Response(json.dumps(responseObj),mimetype='application/json') 

# TODO what should we do about the files which have no retention date

###################################################################################################
@app.route('/swift/containers/<containerName>/DeleteOldFiles/', methods=['Delete'])
def DeleteOldFiles(containerName):
	return CheckOldFiles(containerName, doDelete=True)

###################################################################################################
#Main Function    
if __name__ == '__main__':
	appPort = os.getenv('VCAP_APP_PORT', '5000')
	appHost = os.getenv('VCAP_APP_HOST', '127.0.0.1')
	app.run(
		host=appHost,
		port=int(appPort),
		debug=True
			
	)

