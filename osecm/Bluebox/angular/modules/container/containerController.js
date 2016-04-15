'use strict';

/**
 * ContainerController
 * controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', 'containerService', 'fileSystemService', 'objectClassService', 'deleteConfirmationModal',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter, containerService, fileSystemService, objectClassService, deleteConfirmationModal) {

    	
    	$scope.isGetObjectsRequestPending = false;
    	$scope.isAllDataLoaded = false;
    	
  	  $scope.objectTableOptions = {
	            headerHeight: 50,
	            rowHeight: 50,
	            footerHeight: false,
	            columnMode: 'force',
	            scrollbarV: false,
	            columns: [
	              { 
	            	  name: "Name", 
	            	  prop: "name",
	            	  cellRenderer: function() {
	            		  return '<b>{{$cell}}</b>';
	            	  }
	              },
	              { 
	            	  name: "Size", 
	            	  prop: "bytes", 
	            	  cellRenderer: function() {
	            		  return '<span>{{$cell | bytes}}</span>';
	            	  }
	              },
	              { name: "Content Type", prop: "content_type" }
	            ]
	          };
    	
            /**
             * contains the relevant information about the current container
             * @type {{name: string, metadata: {objectClass: string, objectCount: number}, metadataFields: Array, objects: Array}}
             */
            $scope.container = {
                name:           $stateParams.containerName,
                metadata:       {
                    objectClass:    "",
                    objectCount:    0
                },
                metadataFields: [],
                objects:        []
            };

            /**
             * the form model for the container             *
             * @type {{name: string, objectClass: string}}
             */
            $scope.containerModel = {
                name:           $stateParams.containerName,
                objectClass:    ""
            };

            /**
             * the form model for the file upload
             * @type {{file: null, retentionDate: null, metadata: {}}}
             */
            $scope.fileModel = {
                file:          null,
                retentionDate: null,
                metadata:      {}
            };

            /**
             * retentionDatePicker configuration
             * @type {{minDate: Date}}
             */
            $scope.retentionDatePicker = {

                // past dates may not be entered
                minDate: new Date()
            };

            /**
             * returns true, if there are no more objects to retrieve from the backend
             * used to prevent further requests
             * @type {function}
             */
            $scope.isEndOfListReached = containerService.isEndOfListReached;

            /**
             * uploaded portion of the file in percent
             * @type {{loaded: number, total: number, percentage: number}}
             */
            $scope.uploadProgress = {
                loaded:     0,
                total:      0,
                percentage: 0
            };

            /**
             * list of the basic object properties that are served directly with the object list (without having to GET details)
             * @type {Array}
             */
            $scope.basicMetadataFields = [
                {
                    name: "Size",
                    objectProperty: "bytes",
                    filter: "bytes",
                    isShownInColumn: true
                },
                {
                    name: "Type",
                    objectProperty: "content_type",
                    filter: "contentType",
                    isShownInColumn: true
                },
                {
                    name: "Hash",
                    objectProperty: "hash",
                    isShownInColumn: false
                },
                {
                    name: "Last modified (UTC)",
                    objectProperty: "last_modified",
                    filter: "date",
                    dateFormat: "medium",
                    isShownInColumn: false
                }
            ];

            /**
             * list of special metadata fields that are not part of the object class, but shall possibly be shown in a column
             * @type {Array}
             */
            $scope.specialMetadataFields = [
                {
                    name: "Date",
                    headerKey: "date",
                    dateFormat: "medium",
                    isShownInColumn: false
                },
                {
                    name: "Last modified",
                    headerKey: "last-modified",
                    dateFormat: "medium",
                    isShownInColumn: false
                },
                {
                    name: "Retention Date",
                    headerKey: "x-object-meta-retentiontime",
                    dateFormat: "mediumDate",
                    isShownInColumn: false
                }
            ];

            /**
             * quits the current container and goes to the parent state
             * optionally broadcasts an error message
             *
             * @param {string|undefined} errorMessage if defined, it will be broadcasted from rootScope
             */
            var quitContainer = function(errorMessage) {
                if (angular.isString(errorMessage)) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type":     "danger",
                        "text":     errorMessage
                    });
                }
                $state.go('fileSystemState');
            };

            /**
             * GET new objects from the container service
             *
             * @param {boolean} reload if true, the list will be reloaded from the beginning
             */
            $scope.getObjects = function() {
            	
            	var numObjsWeHave = $scope.container.objects.length;
            	var lastObj = $scope.container.objects[numObjsWeHave - 1]; 
            	var marker = lastObj ? lastObj.name : "";
            	
            	if ($scope.isGetObjectsRequestPending) return;
                $scope.isGetObjectsRequestPending = true;
                
                
                containerService
                    .getObjects($scope.container, $scope.prefix, marker, 20)
                    .then(function (response) {

                        // if the object class has changed
                        if (response.metadata.objectClass !== $scope.container.metadata.objectClass) {

                            // update the form model if it has not been changed by the user
                            if ($scope.isContainerModelInSync()) {
                                $scope.containerModel.objectClass = response.metadata.objectClass;
                            }

                            getMetadataFields(response.metadata.objectClass);
                        }

                        
                        $scope.container.objects = $scope.container.objects.concat(response.objects);
                        $scope.container.metadata = response.metadata;
                        
                        $scope.isGetObjectsRequestPending = false;
                        
                        $scope.isAllDataLoaded = (response.metadata.objectCount == $scope.container.objects.length);

                        if (isAnyMetadataFieldShownInColumn()) {
                            getAllMissingDetails();
                        }
                    })
                    .catch(function (response) {
                    	if (401 == response.status) {
                    		$state.go('loginState', {noAuth: true});
                    		return;
                    	}
                        if (response.status === 404) {
                            quitContainer("Container \"" + $scope.container.name + "\" not found.");
                        } else {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": response.data
                            });
                        }
                        $scope.isGetObjectsRequestPending = false;
                    });
            };

            /**
             * updates the metadata fields according to the given object class
             *
             * @param {string} objectClassName the name of the object class
             */
            var getMetadataFields = function(objectClassName) {
                if (!objectClassName) {
                    // if the object class has been unset, reset the metadata fields
                    $scope.container.metadataFields = [];
                    $scope.fileModel.metadata = {};
                } else {
                    // update the metadata fields
                    $scope.isGetObjectClassRequestPending = true;
                    objectClassService
                        .getObjectClass(objectClassName)
                        .then(function(objectClass) {
                            $scope.isObjectClassOutdated = false;
                            var metadataFields = $filter('jsonSchema')(objectClass.schema, true).metadataFields;
                            setAdditionalPropertiesForMetadataFields(metadataFields);
                            updateMetadataInputFields($scope.container.metadataFields, metadataFields);
                            $scope.container.metadataFields = metadataFields;
                            $scope.isGetObjectClassRequestPending = false;
                        })
                        .catch(function (response) {
                            if (response.status === 404) {
                                $scope.isObjectClassOutdated = true;
                            } else {
                                $rootScope.$broadcast('FlashMessage', {
                                    "type": "danger",
                                    "text": response.data
                                });
                            }
                            $scope.isGetObjectClassRequestPending = false;
                        });
                }
            };

            /**
             * adds the following properties to metadata fields:
             *  - headerKey the HTTP header key by which the metadata value is provided
             *  - dateFormat for all metadata fields that tells how to display the date
             *
             * @param metadataFields an array of metadata fields
             */
            var setAdditionalPropertiesForMetadataFields = function(metadataFields) {
                for (var i in metadataFields) {
                    var metadataField = metadataFields[i];
                    metadataField.headerKey = $filter("metadataHeaderField")(metadataField.name, $scope.container.metadata.objectClass);
                    if (metadataField.type.inputType === 'date') {
                        metadataField.dateFormat = "mediumDate";
                    }
                }
            };

            /**
             * checks if there is any metadata field that is required
             *
             * @returns {boolean} true if there is at least one metadata field that is required, else false
             */
            $scope.isAnyMetadataFieldRequired = function() {
                return Boolean(_.findWhere($scope.container.metadataFields, {required: true}));
            };

            /**
             * compares the new metadata fields with the old ones and updates the fileModel if necessary
             *
             * @param {Array} oldMetadataFields the old metadata fields
             * @param {Array} newMetadataFields the new metadata fields
             */
            var updateMetadataInputFields = function(oldMetadataFields, newMetadataFields) {
                // check old metadata fields for stale ones to delete
                for (var i in oldMetadataFields) {
                    var oldMetadataField = oldMetadataFields[i];
                    var newMetadataField = _.findWhere(newMetadataFields, {name: oldMetadataField.name});
                    if (!newMetadataField) {
                        // if the field is no longer there, delete the input model
                        delete $scope.fileModel.metadata[oldMetadataField.name];
                    }
                }

                // update the input model for relevant new metadata fields
                for (i in newMetadataFields) {
                    newMetadataField = newMetadataFields[i];
                    oldMetadataField = _.findWhere(oldMetadataFields, {name: newMetadataField.name});

                    // if the field is new OR
                    // if the field types are different OR
                    // if the default value has changed and the user has not interacted with it
                    if (!oldMetadataField
                        || oldMetadataField.type.inputType !== newMetadataField.type.inputType
                        || (oldMetadataField.default !== newMetadataField.default && $scope.uploadForm[oldMetadataField.name].$pristine)
                    ) {
                        // (re-)set the input model to the default value
                        $scope.fileModel.metadata[newMetadataField.name] = newMetadataField.default;
                    }
                }
            };

            /**
             * PUT a container update to the file system service
             */
            $scope.updateContainer = function() {
                fileSystemService
                    .updateContainer({
                        name:           $scope.container.name,
                        objectClass:    $scope.containerModel.objectClass
                    })
                    .then(function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Container updated."
                        });
                        $scope.container.metadata.objectClass = $scope.containerModel.objectClass;
                        $scope.showContainerForm = false;
                        getMetadataFields($scope.containerModel.objectClass);
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data
                        });
                    });
            };

            /**
             * checks if the container form model is in sync with the actual values
             *
             * @returns {boolean} true, if the form model is identical to the actual values, else false
             */
            $scope.isContainerModelInSync = function() {
                return $scope.containerModel.objectClass === $scope.container.metadata.objectClass;
            };

            /**
             * resets the container form
             */
            $scope.resetContainerForm = function() {
                $scope.showContainerForm = false;
                $scope.containerModel.objectClass = $scope.container.metadata.objectClass;
            };

            /**
             * DELETE an object from the container
             *
             * @param {object} object the object to delete
             */
            $scope.deleteObject = function(object) {
                deleteConfirmationModal
                    .open(object.name, "object")
                    .result
                    .then(function() {
                        return containerService
                            .deleteObject($scope.container, object)
                            .then(function() {
                                $rootScope.$broadcast('FlashMessage', {
                                    "type": "success",
                                    "text": "Object \"" + object.name + "\" deleted."
                                });
                                // update objectCount and remove object from list
                                $scope.container.metadata.objectCount--;
                                $scope.container.objects = _.reject($scope.container.objects, object);
                            })
                            .catch(function (response) {
                                $rootScope.$broadcast('FlashMessage', {
                                    "type":     "danger",
                                    "text":     response.data
                                });
                            });
                    });
            };

            /**
             * upload the file of the uploadForm
             */
            $scope.uploadObject = function() {
                $scope.uploadProgress.percentage = 0;
                containerService
                    .uploadObject($scope.fileModel.file, $scope.container.name, $scope.fileModel.metadata, $scope.fileModel.retentionDate)
                    .then(
                        function() {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "success",
                                "text": "File \"" + $scope.fileModel.file.name + "\" uploaded."
                            });
                            resetProgressBar();

                            // reload objects
                            $scope.getObjects(true);
                        },
                        function(response) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type":     "danger",
                                "text":     response.data
                            });
                            resetProgressBar();
                        },
                        function(event) {
                            // update upload progress
                            $scope.uploadProgress.loaded = parseInt(event.loaded);
                            $scope.uploadProgress.total = parseInt(event.total);
                            $scope.uploadProgress.percentage = parseInt(100.0 * event.loaded / event.total);
                        }
                    );
            };

            /**
             * resets the upload progress bar after 0.5s delay
             */
            var resetProgressBar = function() {
                $timeout(function() {
                    $scope.uploadProgress.percentage = 0;
                }, 500);
            };

            /**
             * toggles the details section for a given object
             *
             * @param {object} object the object to toggle the details for
             */
            $scope.toggleDetails = function(object) {
                // toggle details
                object.showDetails = !object.showDetails;

                // retrieve the details if they shall be shown
                if (object.showDetails) {
                    getDetails(object);
                }
            };

            /**
             * GET the details for an object
             *
             * @param object the object to get the details for
             */
            var getDetails = function(object) {
                containerService
                    .getDetails($scope.container, object)
                    .then(function (details) {
                        parseMetadataDates(details);
                        object.details = details;
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data
                        });
                    });
            };

            /**
             * parses all dates in a metadata array to Date objects
             *
             * @param {Array} metadata the details of an object to be parsed
             */
            var parseMetadataDates = function(metadata) {
                for (var key in metadata) {
                    var metadataField = $scope.getMetadataField(key);
                    if (metadataField && metadataField.dateFormat) {
                        var parsedDate = Date.parse(metadata[key]);
                        metadata[key] = isNaN(parsedDate) ? metadata[key] : parsedDate;
                    }
                }
            };

            /**
             * returns the metadata field (either special or custom) for a given HTTP header key
             *
             * @param headerKey the HTTP header key
             */
            $scope.getMetadataField = function(headerKey) {
                return _.findWhere($scope.specialMetadataFields.concat($scope.container.metadataFields), {headerKey: headerKey})
            };

            /**
             * toggles the column for a given metadata field and loads the objects' details if necessary
             *
             * @param metadataField the metadata field to toggle the column for
             */
            $scope.toggleMetadataFieldColumn = function(metadataField) {
                metadataField.isShownInColumn = !metadataField.isShownInColumn;

                // if the metadataField is set to be shown
                if (metadataField.isShownInColumn) {
                    getAllMissingDetails();
                }
            };

            /**
             * get the details for all objects that are missing them
             */
            var getAllMissingDetails = function() {
                var objectsWithoutDetails = _.filter($scope.container.objects, function(object) {
                    return !object.details;
                });
                angular.forEach(objectsWithoutDetails, getDetails);
            };

            /**
             * checks if there is any metadata field that is shown in a column
             *
             * @returns {boolean} true if there is at least one metadata field that is shown in a column, else false
             */
            var isAnyMetadataFieldShownInColumn = function() {
            	return Boolean(_.findWhere($scope.container.metadataFields.concat($scope.specialMetadataFields), {isShownInColumn: true}));
            };


            // quit the container if there is no name provided
            if (!$stateParams.containerName) {
                quitContainer("Cannot enter container: no container name provided.");
            } else {
                // initial retrieval
                $scope.getObjects(0,10);
                $scope.isInitialRetrievalDone = true;
            }

            // update the metadata fields if the current class was modified
            $scope.$on('objectClassModified', function(event, objectClass) {
                // if it is the current object class of the container, update the metadata fields
                if (objectClass.name === $scope.container.metadata.objectClass) {
                    updateMetadataInputFields($scope.container.metadataFields, objectClass.metadataFields);
                    $scope.container.metadataFields = objectClass.metadataFields;
                }
            });

            // reset metadata fields if a class has been deleted
            $scope.$on('objectClassDeleted', function() {
                // reset the metadata fields
                $scope.container.metadataFields = [];
                $scope.fileModel.metadata = {};
            });
        }]);