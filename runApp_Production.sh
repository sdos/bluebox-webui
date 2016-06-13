#!/bin/bash


gunicorn --config=config_gunicorn.py mcm.Bluebox:app
