# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import logging
import uuid

from flask import request, Response
from swiftclient import ClientException
from swiftclient import client

from mcm.Bluebox import app
from mcm.Bluebox import appConfig
from mcm.Bluebox.exceptions import HttpError

"""
	###########################################################################
	Constants
	###########################################################################

"""
log = logging.getLogger()

HEADER_NAME_TOKEN = "X-XSRF-TOKEN"
COOKIE_NAME_TOKEN = "XSRF-TOKEN"

COOKIE_NAME_USER = "MCM-USER"
COOKIE_NAME_TENANT = "MCM-TENANT"
COOKIE_NAME_SESSION_ID = "MCM-SESSION-ID"

API_ROOT = "/api_account"


"""
	###########################################################################
	Login, Authentication
	###########################################################################

"""


@app.route(API_ROOT + "/login", methods=["POST"])
def doLogin():
	try:
		user = request.json.get("user")
		tenant = request.json.get("tenant")
		password = request.json.get("password")
		log.debug("authenticating tenant: {},  user: {}".format(tenant, user))

		token = doAuthGetToken(tenant, user, password)
		r = Response()
		r.set_cookie(COOKIE_NAME_TOKEN, value=token)
		r.set_cookie(COOKIE_NAME_TENANT, value=tenant)
		r.set_cookie(COOKIE_NAME_USER, value=user)
		r.set_cookie(COOKIE_NAME_SESSION_ID, value=str(uuid.uuid4()))
		return r
	except ClientException as e:
		log.exception("Login error")
		raise HttpError(e.msg, 401)
	except Exception:
		log.exception("Login error")
		raise HttpError("Internal Server Error", 500)


def doAuthGetToken(tenant, user, password):
	log.debug("Connecting to regular swift at: {}".format(appConfig.swift_auth_url))
	swift_store_url = appConfig.swift_store_url.format(tenant)
	if (1 == appConfig.swift_auth_version):
		swift_user = tenant + ":" + user
	else:
		swift_user = user
	c = client.Connection(authurl=appConfig.swift_auth_url,
	                      user=swift_user,
	                      key=password,
	                      auth_version=appConfig.swift_auth_version,
	                      os_options={"project_id": tenant,
	                                  "user_id": swift_user})
	if c.get_auth()[0] != swift_store_url:
		log.warning(
			"swift suggested a different storage endpoint than our config: {} -- Swift suggests: {}".format(swift_store_url,
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

"""
	###########################################################################
	Validation, Security
	###########################################################################

"""


def get_token_from_request(request):
	t = request.cookies.get(COOKIE_NAME_TOKEN)
	if t:
		return t
	else:
		raise HttpError("cookie missing (token)", 401)


def get_tenant_from_request(request):
	t = request.cookies.get(COOKIE_NAME_TENANT)
	if t:
		return t
	else:
		raise HttpError("cookie missing (tenant)", 401)


def get_swift_store_url_from_request(request):
	t = get_tenant_from_request(request)
	su = appConfig.swift_store_url.format(t)
	return su


def get_user_from_request(request):
	t = request.cookies.get(COOKIE_NAME_USER)
	if t:
		return t
	else:
		raise HttpError("cookie missing (user)", 401)


def assert_correct_tenant(request, tenant):
	"""
	this app needs to be configured for a single customer
	until this is changed, we must only accept requests for this tenant
	:param tenant:
	:return:
	"""
	assert_token_tenant_validity(request)
	t = get_tenant_from_request(request)
	if (tenant != t):
		raise HttpError("Tenant is invalid", 401)


def assert_token_tenant_validity(request):
	"""
	the credentials are  checked against swift.
	:param tenant:
	:param token:
	:return:
	"""
	assert_no_xsrf(request)
	swift_store_url = get_swift_store_url_from_request(request)
	try:
		sw = client.Connection(
			preauthtoken=request.cookies.get(COOKIE_NAME_TOKEN),
			preauthurl=swift_store_url
		)
		h = sw.head_account()
		if not h:
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
	c = request.cookies.get(COOKIE_NAME_TOKEN)
	h = request.headers.get(HEADER_NAME_TOKEN)
	log.debug("CHECKING XSRF")
	log.debug("cookie: {} - header: {}".format(c, h))
	if c != h:
		raise (HttpError("XSRF?", 500))


"""
	###########################################################################
	HTTP-API endpoints
	###########################################################################

"""


@app.route(API_ROOT + "/account", methods=["GET"])
def getAccount():
	swiftRcString = """
#!/bin/bash
export ST_AUTH={auth}
export ST_USER={tenant}:{user}
export ST_KEY=<your password>
	"""
	assert_token_tenant_validity(request)
	s = swiftRcString.format(
		auth=get_swift_store_url_from_request(request),
		tenant=get_tenant_from_request(request),
		user=get_user_from_request(request))
	return Response(s, mimetype="text/plain")


"""
@app.route(API_ROOT + "/tenant", methods=["GET"])
def getTenant():
	return Response(appConfig.swift_tenant, mimetype="text/plain")
"""
