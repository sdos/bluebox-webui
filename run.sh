#!/usr/bin/env bash
#	Project MCM
#
#	Copyright (C) <2015-2017> Tim Waizenegger, <University of Stuttgart>
#
#	This software may be modified and distributed under the terms
#	of the MIT license.  See the LICENSE file for details.


source setenv.sh

# listen only to localhost, enable debug
#python _runApp_Development.py

# listen on all interfaces, no debug
_runApp_Gunicorn.sh