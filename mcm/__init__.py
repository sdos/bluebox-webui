# -*- coding: utf-8 -*-

"""
	Project Bluebox

	Copyright (C) <2016> <University of Stuttgart>

	This software may be modified and distributed under the terms
	of the MIT license.  See the LICENSE file for details.
"""
import coloredlogs, logging
from mcm.Bluebox import configuration

log_format = '%(asctime)s %(module)s %(name)s[%(process)d] %(levelname)s %(message)s'
field_styles = {'module': {'color': 'magenta'}, 'hostname': {'color': 'magenta'}, 'programname': {'color': 'cyan'},
                'name': {'color': 'blue'}, 'levelname': {'color': 'black', 'bold': True}, 'asctime': {'color': 'green'}}

coloredlogs.install(level=configuration.log_level, fmt=log_format, field_styles=field_styles)


logging.getLogger("werkzeug").setLevel(level=logging.WARNING)
logging.getLogger("swiftclient").setLevel(level=logging.WARNING)


"""
import logging
logging.basicConfig(level=appConfig.log_level, format=log_format)
"""