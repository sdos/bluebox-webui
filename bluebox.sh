#!/bin/bash
#	Project MCM
#
#	Copyright (C) <2015-2017> Tim Waizenegger, <University of Stuttgart>
#
#	This software may be modified and distributed under the terms
#	of the MIT license.  See the LICENSE file for details.

cd /bluebox-webui
git pull
export PYTHONPATH=$PYTHONPATH:/bluebox-webui



# there are 2 configured runtimes: a) flask development server, b) gunicorn production server

# run as a flask multithread app
#python _runApp_Development_nodebug.py

# run in a gunicorn multiprocessed server
./_runApp_Gunicorn.sh
