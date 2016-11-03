# -*- coding: utf-8 -*-
"""
	Project Bluebox 

	Copyright (C) <2015> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
# initialize logging

import logging
import re

from swiftclient import client

from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError
from mcm.Bluebox.exceptions import exception_wrapper

log = logging.getLogger()

"""

	Auth/Login

"""


def doAuthGetToken(user, password):
	log.debug("Connecting to regular swift at: {}".format(appConfig.swift_url))
	if (1 == appConfig.swift_auth_version):
		user = appConfig.swift_tenant + ":" + user
	c = client.Connection(authurl=appConfig.swift_url,
	                      user=user,
	                      key=password,
	                      auth_version=appConfig.swift_auth_version,
	                      os_options={"project_id": appConfig.swift_tenant,
	                                  "user_id": user})
	if c.get_auth()[0] != appConfig.swift_store_url:
		log.error(
			"swift suggested a different storage endpoint than our config: {} {}".format(appConfig.swift_store_url,
			                                                                             c.get_auth()[0]))
	return c.get_auth()[1]


"""
deprecated. left for documentation purposes.
this does "manual" authentication in order to receive an authtoken.
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
"""


def assert_correct_tenant(tenant):
	"""
	this app needs to be configured for a single customer
	until this is changed, we must only accept requests for this tenant
	:param tenant:
	:return:
	"""
	if (not tenant == appConfig.swift_tenant):
		raise HttpError("Tenant is invalid", 401)


def assert_token_validity(request):
	"""
	the credentials are  checked against swift.
	:param tenant:
	:param token:
	:return:
	"""
	COOKIE_NAME = "XSRF-TOKEN"
	assert_no_xsrf(request)
	try:
		sw = client.Connection(
			preauthtoken=request.cookies.get(COOKIE_NAME),
			preauthurl=appConfig.swift_store_url
		)
		h = sw.head_account()
		if h:
			return
			raise HttpError("Token is not valid", 401)
	except HttpError as e:
		raise (e)
	except Exception:
		raise HttpError("Error checking token", 401)


def assert_no_xsrf(request):
	"""
	prevent cross-site-request-forgery (XSRF)
	this is achieved by comparing a header field and a cookie.
	see explanation here: https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-Header_Token
	:param request:
	:return:
	"""
	COOKIE_NAME = "XSRF-TOKEN"
	HEADER_NAME = "X-XSRF-TOKEN"
	c = request.cookies.get(COOKIE_NAME)
	h = request.headers.get(HEADER_NAME)
	log.debug("CHECKING XSRF")
	log.debug("cookie: {} - header: {}".format(c, h))
	if c != h:
		raise (HttpError("XSRF token error", 401))


"""

	Swift API interaction

"""


class SwiftConnect:
	VALID_ACC_METADATA_KEY_REGEX = re.compile("x-account-meta-[a-z0-9-]+")

	def __init__(self, token):
		self.conn = client.Connection(
			preauthtoken=token,
			preauthurl=appConfig.swift_store_url
		)

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

	# returns all account meta data key value pairs
	def get_account_metadata(self):
		log.debug("Retrieving account meta data")
		return self.conn.head_account()

	# stores the specified key value pair in the account meta data
	# the key must match the following regex: 'x-account-meta-[a-z0-9-]+',
	# otherwise an value exception will be raised
	def store_account_metadata(self, key, value):
		log.debug("Storing account meta data, key: {}, value: {}".format(key, value))
		if not self.VALID_ACC_METADATA_KEY_REGEX.fullmatch(key):
			raise ValueError("meta data key: {} does not match the required pattern: {}".format(key,
			                                                                                    self.VALID_ACC_METADATA_KEY_REGEX.pattern))

		self.conn.post_account({key: value})

	# stores the specified key value pair to an undefined place
	def store_metadata(self, key, value):
		containers = self.get_container_list()[1]
		if "internal-object-class-store" not in [container.get("name") for container in containers]:
			self.conn.put_container("internal-object-class-store")

		self.conn.put_object("internal-object-class-store", key, value)

	# returns the meta data for the specified key or None
	def get_metadata(self, key):
		try:
			data = self.conn.get_object("internal-object-class-store", key)[1]
			return data.decode("latin-1")  # assume string
		except Exception:
			return None

	def get_metadata_keys(self):
		try:
			tmp = self.conn.get_container("internal-object-class-store")[1]
		except Exception:  # container does not exist
			return []

		return [entry.get("name") for entry in tmp]

	@exception_wrapper(404, "resource does not exist", log)
	def remove_metadata(self, key):
		self.conn.delete_object("internal-object-class-store", key)

	@exception_wrapper(404, "resource does not exist", log)
	def update_object_metadata(self, object_name, container_name, metadata_dict):
		log.debug("updating object: {} in container: {} mith md: {}".format(object_name, container_name, metadata_dict))
		rsp = dict()
		self.conn.post_object(container=container_name, obj=object_name, headers=metadata_dict, response_dict=rsp)
		return rsp

	##############################################################################

	# Creating a Container
	def create_container(self, container_name, container_metadata=None):
		log.debug("Creating new container with name: {} and meta data: {}".format(container_name, container_metadata))
		self.conn.put_container(container_name, headers=container_metadata)
		return True

	# deletes a container and all objects within
	@exception_wrapper(404, "requested resource does not exist", log)
	def delete_container(self, container_name):
		log.debug("Deleting container with name: {}".format(container_name))
		cont_data = self.conn.get_container(container_name)
		object_count = int(cont_data[0].get("x-container-object-count"))
		if (object_count > 0):
			for obj in cont_data[1]:
				self.conn.delete_object(container_name, obj.get("name"))
		self.conn.delete_container(container_name)

	@exception_wrapper(404, "resource does not exist", log)
	def get_container_metadata(self, container_name):
		log.debug("Retrieving meta data of container: {}".format(container_name))
		return self.conn.head_container(container_name)

	# Retrieves list of all objects of the specified container
	@exception_wrapper(404, "requested resource does not exist", log)
	def get_object_list(self, container_name, limit=None, marker=None, prefix=None):
		log.debug("Retrieving list of all objects of container: {} with parameter: limit = {}, marker = {}, prefix = {}"
		          .format(container_name, limit, marker, prefix))
		full_listing = limit is None  # bypass default limit of 10.000 of swift-client
		files = self.conn.get_container(
			container_name, marker=marker, limit=limit, prefix=prefix,
			full_listing=full_listing)
		return files

	##############################################################################

	def object_upload(self, object_name, container_name, object_as_file, metadata_dict, as_stream=False):
		log.debug("Putting object: {} in container: {}".format(object_name, container_name))
		if as_stream:
			self.conn.put_object(
				container=container_name, obj=object_name,
				contents=object_as_file, headers=metadata_dict,
				chunk_size=65536)
		else:
			c = object_as_file if type(object_as_file) == str else object_as_file.read()
			self.conn.put_object(
				container=container_name, obj=object_name,
				contents=c, headers=metadata_dict)

	# Stream object
	@exception_wrapper(404, "requested resource does not exist", log)
	def get_object_as_generator(self, container_name, object_name):
		log.debug("Retrieving object: {} in container: {} as stream".format(container_name, object_name))
		return self.conn.get_object(container_name, object_name, resp_chunk_size=8192)

	# deleting an object 
	@exception_wrapper(404, "requested resource does not exist", log)
	def delete_object(self, container_name, object_name):
		log.debug("Deleting object: {} in container: {}".format(object_name, container_name))
		self.conn.delete_object(container_name, object_name)

	# retrieving the meta data of the specified object
	@exception_wrapper(404, "resource does not exist", log)
	def get_object_metadata(self, container_name, object_name):
		log.debug("Retrieving meta data for object: {} in container: {}".format(object_name, container_name))
		return self.conn.head_object(container_name, object_name)

	##############################################################################

	# deleting objects 
	def delete_objects(self, container_name, object_names):
		log.debug("Deleting multiple objects: {} in container: {}".format(object_names, container_name))
		for object_name in object_names:
			self.conn.delete_object(container_name, object_name)

		##############################################################################

	# Closing the connection
	def close_connection(self):
		self.conn.close()
