#!/bin/bash

gunicorn --config=config_gunicorn.py Bluebox:app
