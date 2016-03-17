#!/bin/bash

gunicorn --workers=6 --bind=0.0.0.0:5000 Bluebox:app
