# This repo contains the web-UI for the SDOS encrypted object store

Bluebox is a web UI for the swift object store with Enterprise Content Management extensions. 
This is the UI for our larger "MCM" research project

Bluebox consists of two parts:
* a small server runtime written in python
* an angularJS frontend

they communicate over an HTTP API. 
The "frontend" is served by the python app as well but any static HTTP server could be used.  


# demo-deployment
deployment automation for the whole system can be found at:

[https://github.com/sdos/deploy-sdos](https://github.com/sdos/deploy-sdos)


## Screenshots

### Login screen
![Bluebox](doc/1.png)

### Container list
![Bluebox](doc/2.png)

### Object class editing
![Bluebox](doc/3.png)

### Create new container, enable SDOS encryption
![Bluebox](doc/4.png)

### Object list for SDOS enabled container
![Bluebox](doc/5.png)

### Allocation view shows how object keys are distributed in the Key Cascade leaves
![Bluebox](doc/6.png)

### Tree view shows the actual nodes of the Key Cascade; work in progress...
![Bluebox](doc/7.png)

### Run tasks to extract/identify metadata and delete old objects
![Bluebox](doc/13.png)

### Metadata is stored unencrypted and can be shown in list columns 
![Bluebox](doc/8.png)

### All entity metadata (from swift) can be shown
![Bluebox](doc/9.png)

### Analytics module allows querying/visualizing metadata
![Bluebox](doc/10.png)

### Overview of all the metadata tables 
![Bluebox](doc/11.png)

### Visualization result
![Bluebox](doc/12.png)



## Dev setup
### first setup after new checkout
make sure to specify a python 3 or higher interpreter for your virtualenv (MCM doesn't support python 2)
in the main directory


    virtualenv venvBB
    . setenv.sh
    (included in setenv) source venvBB/bin/activate
    pip install -r requirements.txt
    cd mcm/Bluebox/angular
    yarnpkg install
    
    
    

 
to leave venv

    deactivate
    
    
    
### install requirements
just install the existing reqs

    pip install -r requirements.txt
    cd mcm/Bluebox/angular
    yarnpkg install
    
install new packages

    pip install <package>
    cd mcm/Bluebox/angular
    yarnpkg add <package>


save new packages to requirements:

    pip freeze --local > requirements.txt
    cd mcm/Bluebox/angular
    yarnpkg add <package>
    
    
update existing packages

    pip freeze --local | grep -v '^\-e' | cut -d = -f 1 | xargs pip install -U
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



