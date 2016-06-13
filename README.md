# mcm-bluebox
Bluebox - part of the Micro Content Management system (MCM)


MCM consists of multiple components that form a small content management system.

Bluebox is a web UI for the swift object store with Enterprise Content Management extensions. This is the UI for our larger "MCM" research project

Bluebox consists of two parts:
* a small server runtime written in python
* an angularJS frontend

they communicate over an HTTP API. 
The "frontend" is served by the python app as well but any static HTTP server could be used.  

## Dev setup
### first setup after new checkout
make sure to specify a python 3 or higher interpreter for your virtualenv (MCM doesn't support python 2)
in the main directory


    virtualenv venvBB
    . setenv.sh
    (included in setenv) source venvBB/bin/activate
    pip install -r requirements.txt
    

 
to leave venv

    deactivate
    
    
    
### use pip to install requirements
just install the existing reqs

    pip install -r requirements.txt
    
install new packages

    pip install <package>


save new packages to requirements:

    pip freeze --local > requirements.txt

## Running
### running after first setup
in the main directory

    . setenv.sh

* for local development/testing: `python runApp_Development.py`
* for production: `./runApp_Production.sh`


### Running on IBM Bluemix (as "Bluemix app") / CloudFoundry
this is possible but hasn't been tested in some time.
* `Procfile` needs to be adapted to execute one of the runners
* dynamic connection to a swift service needs to be implemented; static config via the config file should work


## Configuration
configuration of the host/port is done inside the two "run" scripts mentioned above.

configuration of the swift backend connection is in the `appConfig.py` file. An example is given by `appConfig.example.py`



