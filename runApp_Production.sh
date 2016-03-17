#!/bin/bash

gunicorn --workers=6 --timeout=600 --graceful-timeout=800 --bind=0.0.0.0:5000 Bluebox:app
