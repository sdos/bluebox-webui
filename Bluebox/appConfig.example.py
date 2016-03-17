# -*- coding: utf-8 -*-
""" 
	Project Bluebox 
	
	Copyright (C) <2015> <University of Stuttgart>
	
	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import os
"""
this is the current config file for bluebox. define the server connection below:

when using the Object Storage service on Bluemix:
swift_url = <url>/v3
swift_user = "<userId>"
swift_pw = "<password>"
swift_auth_version = 3
swift_tenant = <projectId>
swift_store_url = <>
"""


swift_url = "http://?????/auth/v1.0"
swift_store_url = ""
swift_user = "<account>:<user>"
swift_pw = "<pw>"
swift_auth_version = 1
swift_tenant = None

"""
Server configuration
"""

netPort = os.getenv("VCAP_APP_PORT", "5000")
#netHost = os.getenv("VCAP_APP_HOST", "0.0.0.0") #run public
netHost = os.getenv("VCAP_APP_HOST", "127.0.0.1") #run only on localhost


