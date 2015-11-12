"""
    Project Bluebox
    2015, University of Stuttgart, IPVS/AS
"""
""" 
    Project Bluebox 
    
    Copyright (C) <2015> <University of Stuttgart>
    
    This software may be modified and distributed under the terms
    of the MIT license.  See the LICENSE file for details.
"""

from flask import jsonify

class HttpError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def to_json(self):
        d = {"message": self.message}
        json = jsonify(d)
        return json