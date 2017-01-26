#!/usr/bin/env bash

source setenv.sh

# listen only to localhost, enable debug
#python _runApp_Development.py

# listen on all interfaces, no debug
./_runApp_Production.sh