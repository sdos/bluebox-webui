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

import base64
import requests
import logging

from swiftclient import client


# initialize logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(module)s - %(levelname)s ##\t  %(message)s')
log = logging.getLogger()


# Function to connect to swift object store
class SwiftConnect:
	def __init__(self, swift_type, swift_url, swift_user, swift_pw):
		self.swift_url = swift_url
		self.swift_user = swift_user
		self.swift_pw = swift_pw
			
		if "BluemixV1Auth" == swift_type:
			self.do_bluemix_v1_auth()
		else:
			self.do_regular_swift_auth()
		
	def do_regular_swift_auth(self):
		log.debug("Connecting to regular swift at: {}".format(self.swift_url))
		self.conn = client.Connection(authurl=self.swift_url, user=self.swift_user, key=self.swift_pw)
			
	def do_bluemix_v1_auth(self):
		log.debug("Connecting to Bluemix V1 swift at: {}".format(self.swift_url))
		authEncoded = base64.b64encode(bytes('{}:{}'.format(self.swift_user, self.swift_pw), "utf-8"))
		authEncoded = "Basic " + authEncoded.decode("utf-8")
		response = requests.get(self.swift_url, headers={"Authorization": authEncoded})
		log.debug(response.headers['x-auth-token'])
		log.debug(response.headers['x-storage-url'])			
		self.conn = client.Connection(
			preauthtoken=response.headers['x-auth-token'],
			preauthurl=response.headers['x-storage-url']		
		)

##############################################################################

	# Creating a Container
	def create_container(self, container_name):
		log.debug("Creating new container with name: {}".format(container_name))
		self.conn.put_container(container_name)
		return True

##############################################################################

	# Creating an object
	def create_object(self, object_name, content, container_name, metadata_dict):
		log.debug("Putting object: {} in container: {} as a whole".format(object_name, container_name))
		self.conn.put_object(
			container=container_name, obj=object_name,
			contents=content, headers=metadata_dict)
		
	def streaming_object_upload(self, object_name, container_name, object_as_file, metadata_dict):
		log.debug("Putting object: {} in container: {} as stream".format(object_name, container_name))
		self.conn.put_object(
			container=container_name, obj=object_name,
			contents=object_as_file, headers=metadata_dict,
			chunk_size=65536)
			
##############################################################################

	# Retrieving an object 
	def get_object(self, container_name, object_name):
		log.debug("Retrieving object: {} in container: {} as a whole".format(container_name, object_name))
		obj_tuple = self.conn.get_object(container_name, object_name)
		return obj_tuple[1]
	
	# Stream object
	def get_object_as_generator(self, container_name, object_name):
		log.debug("Retrieving object: {} in container: {} as stream".format(container_name, object_name))
		return self.conn.get_object(container_name, object_name, resp_chunk_size=8192)
	
##############################################################################

	# deleting an object 
	def delete_object(self, container_name, object_name):
		log.debug("Deleting object: {} in container: {}".format(object_name, container_name))
		self.conn.delete_object(container_name, object_name)

##############################################################################

	# deleting objects 
	def delete_objects(self, container_name, object_names):
		log.debug("Deleting multiple objects: {} in container: {}".format(object_names, container_name))
		for object_name in object_names:
			self.conn.delete_object(container_name, object_name)

##############################################################################

	# Creating an container list
	def get_container_list(self, limit=None, marker=None, prefix=None):
		log.debug("Retrieving list of all containers with parameter: limit = {}, marker = {}, prefix = {}"
				.format(limit, marker, prefix))
		full_listing = limit is None  # bypass default limit of 10.000 of swift-client
		containers = self.conn.get_account(
			limit=limit, marker=marker,
			prefix=prefix, full_listing=full_listing)
		return containers

##############################################################################

	#Creating an container list
	def get_object_list(self, container_name, limit=None, marker=None, prefix=None):
		log.debug("Retrieving list of all objects of container: {} with parameter: limit = {}, marker = {}, prefix = {}"
				.format(container_name, limit, marker, prefix))
		full_listing = limit is None  # bypass default limit of 10.000 of swift-client
		files = self.conn.get_container(
			container_name, marker=marker, limit=limit, prefix=prefix,
			full_listing=full_listing)
		return files                    

##############################################################################

	#Retrieving an object Metadata 
	def get_object_metadata(self, container_name, object_name):
		log.debug("Retrieving meta data for object: {} in container: {}".format(object_name, container_name))
		return self.conn.head_object(container_name, object_name)
	
##############################################################################

	#Closing the connection 
	def close_connection(self):
		self.conn.close()
