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
#log_level = logging.CRITICAL
#log_level = logging.ERROR
#log_level = logging.WARNING
#log_level = logging.INFO
log_level = logging.DEBUG

"""
################################################################################
Server / runtime config
################################################################################
"""
netPortDev = os.getenv("VCAP_APP_PORT", "8000")
netHostDev = os.getenv("VCAP_APP_HOST", "127.0.0.1")

netPortProd = os.getenv("VCAP_APP_PORT", "8000")
netHostProd = os.getenv("VCAP_APP_HOST", "0.0.0.0")


#swift_auth_url = "http://192.168.209.204:8080/auth/v1.0"
#swift_auth_url = "http://192.168.209.208:3000/auth/v1.0"
#swift_auth_url = "http://129.69.209.131:5000/v2.0"
#swift_auth_url = "http://localhost:3000/auth/v1.0"
swift_auth_url = "http://localhost:3000/v2.0"

#swift_user = "test:tester"
#swift_pw = "testing"
swift_auth_version = "2.0"
#swift_tenant = "test"

#swift_store_url_valid_prefix = "http://192.168.209.204:8080/v1/AUTH_"
#swift_store_url_valid_prefix = "http://192.168.209.208:3000/v1/AUTH_"
#swift_store_url_valid_prefix = "http://129.69.209.131:8080/v1/AUTH_"
swift_store_url_valid_prefix = "http://localhost:3000/v1/AUTH_"

nodered_url = "http://192.168.209.208:1880"
#nodered_url = "http://localhost:1880"



"""
################################################################################
Kafka bootstrap broker for messaging / Task setup
################################################################################
"""
kafka_broker_endpoint = "192.168.209.208:9092"
zookeeper_endpoint = "192.168.209.208:2181"

"""
################################################################################
used by Analytics. Endpoint of the metadata warehouse PostgreSQL db
################################################################################
"""
metadata_warehouse_endpoint = {
	"database": "mcm-metadata_{}",
	"user": "postgres",
	"password": "testing",
	"host": "192.168.209.208",
	"port": "5432"
}