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
from mcm.Bluebox import configuration
from mcm.Bluebox import SwiftConnect
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
COOKIE_NAME_TENANT_ID = "MCM-TENANT-ID"
COOKIE_NAME_TENANT_NAME = "MCM-TENANT-NAME"
COOKIE_NAME_SWIFT_URL = "MCM-SWIFT-URL"
COOKIE_NAME_SESSION_ID = "MCM-SESSION-ID"

API_ROOT = "/api_account"

"""
	###########################################################################
	Login, Authentication
	###########################################################################

"""


@app.route(API_ROOT + "/login", methods=["POST"])
def doLogin():
    """
    handle the UI log in against a configured auth provider; swift internal, openstack keystone etc.
    :return:
    """
    try:
        user = request.json.get("user")
        tenantName = request.json.get("tenant")
        password = request.json.get("password")
        log.debug("authenticating tenant: {},  user: {}".format(tenantName, user))

        swift_url, token = doAuthGetToken(tenantName, user, password)
        r = Response()
        r.set_cookie(COOKIE_NAME_TOKEN, value=token)
        r.set_cookie(COOKIE_NAME_TENANT_NAME, value=tenantName)
        r.set_cookie(COOKIE_NAME_TENANT_ID, value=strip_url_to_tenant_id(swift_url))
        r.set_cookie(COOKIE_NAME_USER, value=user)
        r.set_cookie(COOKIE_NAME_SESSION_ID, value=str(uuid.uuid4()))
        return r
    except ClientException as e:
        log.exception("Login error")
        raise HttpError(e.msg, 401)
    except Exception:
        log.exception("Login error")
        raise HttpError("Internal Server Error", 500)


def doAuthGetToken(_tenant, _user, _password):
    log.debug("Connecting to authentication endpoint at: {}".format(configuration.swift_auth_url))
    swift_store_url = configuration.swift_store_url_valid_prefix.format(_tenant)

    if ("1.0" == configuration.swift_auth_version):
        c = client.Connection(authurl=configuration.swift_auth_url,
                              user=_tenant + ":" + _user,
                              key=_password,
                              auth_version="2.0",
                              os_options={"project_id": _tenant,
                                          "user_id": _user})

    elif ("2.0" == configuration.swift_auth_version):
        c = client.Connection(authurl=configuration.swift_auth_url,
                              user=_user,
                              key=_password,
                              tenant_name=_tenant,
                              auth_version="2.0")
    else:
        log.error("Auth version not supported...")
        return None
    return c.get_auth()


def get_swift_connection(request):
    url = get_swift_url_from_request(request)
    token = get_token_from_request(request)
    return SwiftConnect.SwiftConnect(url, token)


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
    t = request.cookies.get(COOKIE_NAME_TENANT_ID)
    if t:
        return t
    else:
        raise HttpError("cookie missing (tenant)", 401)


def get_and_assert_tenant_from_request(request):
    assert_token_tenant_validity(request)
    return get_tenant_from_request(request)


def get_swift_url_from_request(request):
    t = get_tenant_from_request(request)
    return configuration.swift_store_url_valid_prefix + t


def strip_url_to_tenant_id(url):
    if not url.startswith(configuration.swift_store_url_valid_prefix):
        raise HttpError("swift returned wrong storage URL")
    return url[len(configuration.swift_store_url_valid_prefix):]


def get_user_from_request(request):
    t = request.cookies.get(COOKIE_NAME_USER)
    if t:
        return t
    else:
        raise HttpError("cookie missing (user)", 401)


def assert_token_tenant_validity(request):
    """
    the credentials are  checked against swift.
    :param tenant:
    :param token:
    :return:
    """
    assert_no_xsrf(request)
    url = get_swift_url_from_request(request)
    token = get_token_from_request(request)

    try:
        sw = client.Connection(
            preauthtoken=token,
            preauthurl=url
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
# for use with python-swiftclient and keystone auth v2.0
# and other openstack tools that use the object store API

export OS_AUTH_URL={swift_auth_url}

# With the addition of Keystone we have standardized on the term **tenant**
# as the entity that owns the resources.
export OS_TENANT_ID={tenant}
export OS_TENANT_NAME="SDOS"
export OS_PROJECT_NAME="SDOS"

# In addition to the owning entity (tenant), OpenStack stores the entity
# performing the action as the **user**.
export OS_USERNAME="{user}"

# With Keystone you pass the keystone password.
echo "Please enter your OpenStack Password: "
read -sr OS_PASSWORD_INPUT
export OS_PASSWORD=$OS_PASSWORD_INPUT

	"""
    assert_token_tenant_validity(request)
    s = swiftRcString.format(
        swift_auth_url=configuration.swift_auth_url,
        tenant=get_tenant_from_request(request),
        user=get_user_from_request(request))
    return Response(s, mimetype="text/plain")


"""
@app.route(API_ROOT + "/tenant", methods=["GET"])
def getTenant():
	return Response(appConfig.swift_tenant, mimetype="text/plain")
"""
