#!/bin/bash


export RUNNING_ON_GUNICORN=True
gunicorn --config=config_gunicorn.py mcm.Bluebox:app
