# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""

import logging
from mcm.Bluebox import appConfig
logging.basicConfig(level=appConfig.log_level, format=appConfig.log_format)