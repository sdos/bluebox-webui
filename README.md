# swift-bluebox
Bluebox is a web UI for the swift object store with Enterprise Content Management extensions

Bluebox consists of two parts:
* a small server runtime written in python
* an angularJS frontend

they communicate over an HTTP API. 
The "frontend" is served by the python app as well but any static HTTP server could be used.  

## Running

* install the requirements stated in requirements.txt (or simply run it and see what's missing...)
* for local development/testing: `python runApp_Development.py`
* for production: `./runApp_Production.sh`


## Configuration
configuration of the host/port is done inside the two "run" scripts mentioned above.

configuration of the swift backend connection is in the `appConfig.py` file. An example is given by `appConfig.example.py`

