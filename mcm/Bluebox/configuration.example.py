# -*- coding: utf-8 -*-
""" 
	Project Bluebox 
	
	Copyright (C) <2015> <University of Stuttgart>
	
	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import logging


"""
###############################################################################
	Log level setting
###############################################################################
"""
# log_level = logging.CRITICAL
# log_level = logging.ERROR
log_level = logging.WARNING
# log_level = logging.INFO
#log_level = logging.DEBUG

"""
################################################################################
Server / runtime config
################################################################################
"""

"""
this is the socket that the "dev" runner will listen on.
VCAP_APP_* variables are used in cloudfoundry environments; the second parameter is the fallback which will be used normally
note that with this config, the DEV runner is only locally visible. Only the PROD runner listening on 0.0.0.0 will be accessible form th eoutside
"""
netPortDev = "8000"
netHostDev = "127.0.0.1"

netPortProd = "8000"
netHostProd = "0.0.0.0"

"""
################################################################################
define the Swift server connection below:
################################################################################
"""

"""
endpoint for swift. localhost:3000 is the default for the SDOS API proxy.
"""
# SDOS on localhost example
swift_auth_url = "http://localhost:3000/v2.0"
swift_store_url_valid_prefix = "http://localhost:3000/v1/AUTH_"
swift_auth_version = "2.0"

# local docker CEPH
#swift_auth_url = "http://172.18.0.2/auth/1.0"
#swift_store_url_valid_prefix = "http://172.18.0.2/swift/v1"
#swift_auth_version = "1.0"

"""
################################################################################
Kafka bootstrap broker for messaging / Task setup
################################################################################
"""
kafka_broker_endpoint = "localhost:9092"
zookeeper_endpoint = "localhost:2181"

"""
################################################################################
used by Analytics. Endpoint of the metadata warehouse PostgreSQL db
################################################################################
"""
metadata_warehouse_endpoint = {
	"database": "mcm-metadata_{}",
	"user": "postgres",
	"password": "testing",
	"host": "localhost",
	"port": "5432"
}


"""
################################################################################
used by Analytics. Please provide the URL that points to the Node-RED root.
################################################################################
"""
nodered_url = "http://localhost:1880"
