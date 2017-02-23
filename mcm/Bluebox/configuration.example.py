# -*- coding: utf-8 -*-
""" 
	Project Bluebox 
	
	Copyright (C) <2015> <University of Stuttgart>
	
	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import logging, os

"""
###############################################################################
	Log level setting
###############################################################################
"""
# log_level = logging.CRITICAL
# log_level = logging.ERROR
log_level = logging.WARNING
# log_level = logging.INFO
# log_level = logging.DEBUG

"""
################################################################################
You can set the "default tenant" of the login page here:
Bluebox/angular/modules/login/loginController.js
it's hardcoded as a default there
################################################################################
"""

"""
################################################################################
Server / runtime config
################################################################################
"""

my_endpoint_port = 8000
my_endpoint_host = os.getenv("MY_ENDPOINT_HOST", "localhost")
my_bind_host = "0.0.0.0"


"""
################################################################################
define the Swift server connection below:
localhost:3000 is the default for the SDOS API proxy.
here we assume that auth/store run on the same host/port. this is true with SDOS
 as well as swift-all-in-one setups.
 If bluebox is directly connected to Swift (without SDOS proxy) then you may need
 to configure two different endpoints below
################################################################################
"""
# env-vars or localhost docker container
swift_host = os.getenv("SWIFT_HOST", "localhost")
swift_port = os.getenv("SWIFT_PORT", 3000)

swift_auth_version = "1.0"

# v1 swift auth
swift_auth_url = "http://{}:{}/auth/v1.0".format(swift_host, swift_port)
swift_auth_url_public = "http://{}:{}/auth/v1.0".format(my_endpoint_host, swift_port)

# v2 keystone auth
#swift_auth_url = "http://{}:{}/v2.0/tokens".format(swift_host, swift_port)
#swift_auth_url_public = "http://{}:{}/v2.0/tokens".format(my_endpoint_host, swift_port)

# store URL is always the same independent of auth version
swift_store_url_valid_prefix = "http://{}:{}/v1/AUTH_".format(swift_host, swift_port)
swift_store_url_valid_prefix_public = "http://{}:{}/v1/AUTH_".format(my_endpoint_host, swift_port)




"""
################################################################################
used by Analytics. Endpoint of the metadata warehouse PostgreSQL db
################################################################################
"""
postgres_host = os.getenv("POSTGRES_HOST", "localhost")
postgres_port = os.getenv("POSTGRES_PORT", 5432)

metadata_warehouse_endpoint = {
    "database": "mcm_metadata_{}",
    "user": "postgres",
    "password": "passw0rd",
    "host": postgres_host,
    "port": postgres_port
}

"""
################################################################################
used by Analytics. Please provide the URL that points to the Node-RED root.
################################################################################
"""
nodered_host = os.getenv("NODERED_HOST", "localhost")
nodered_port = os.getenv("NODERED_PORT", 1880)

nodered_url = "http://{}:{}".format(nodered_host, nodered_port)
