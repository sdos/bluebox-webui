# swift-bluebox
Bluebox is a web UI for the swift object store with Enterprise Content Management extensions. This is the UI for our larger "OSECM" research project

Bluebox consists of two parts:
* a small server runtime written in python
* an angularJS frontend

they communicate over an HTTP API. 
The "frontend" is served by the python app as well but any static HTTP server could be used.  

## Running

* install the requirements stated in requirements.txt (or simply run it and see what's missing...) `pip3 install -r requirements.txt`
* for local development/testing: `python runApp_Development.py`
* for production: `./runApp_Production.sh`

### Running on IBM Bluemix (as "Bluemix app") / CloudFoundry
this is possible but hasn't been tested in some time.
* `Procfile` needs to be adapted to execute one of the runners
* dynamic connection to a swift service needs to be implemented; static config via the config file should work


## Configuration
configuration of the host/port is done inside the two "run" scripts mentioned above.

configuration of the swift backend connection is in the `appConfig.py` file. An example is given by `appConfig.example.py`

## Dev setup
### use a python virtualenv
in the main directory


    virtualenv venv
    source venv/bin/activate

    
to leave venv

    deactivate
    
### use pip to install requirements
just install the existing reqs

    pip3 install -r requirements.txt
    
install new packages

    pip3 install <package>


save new packages to requirements:

    pip3 freeze --local > requirements.txt


