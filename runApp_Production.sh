#!/bin/bash


p=$(pwd)
export PYTHONPATH=$PYTHONPATH:$p/osecm

gunicorn --config=config_gunicorn.py osecm.Bluebox:app
