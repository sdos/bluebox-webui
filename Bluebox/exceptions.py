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
# decorator that reraises all raised exceptions as HttpErrors

from functools import wraps

from flask import jsonify


def exception_wrapper(status_code, error_msg, log):
    def exception_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                log.debug("caught exception: {} when calling function: {} with args: {}, kwargs: {}. Raising HttpError.".format(e, f.__name__, args, kwargs))
                raise HttpError(error_msg, status_code)
        return wrapper
    return exception_decorator


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
    
    def to_string(self):
        return self.message