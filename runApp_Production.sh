#!/bin/bash

gunicorn --config=config_gunicorn.py osecm.Bluebox:app
