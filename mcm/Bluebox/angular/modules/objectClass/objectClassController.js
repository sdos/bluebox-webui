'use strict';

/**
 * ObjectClassController
 * controller for the object class form
 */
objectClassModule.controller('ObjectClassController',
    ['$scope', '$rootScope', '$filter', '$mdDialog', 'objectClassService', 'METADATA_FIELD_TEMPLATE', 'TYPE_OPTIONS',
        function($scope, $rootScope, $filter, $mdDialog, objectClassService, METADATA_FIELD_TEMPLATE, TYPE_OPTIONS) {

    	console.log("hello, ObjectClassController");
    	
    	$scope.uiMode = {
    		newEntry: true,
    		selectExisting: true,
    		edit: false
    	};
    	
    	
    	$scope.allObjectClasses = [];
    	
        /**
         * the object class model that is being edited
         * @type {{name: string, metadataFields: Array}}
         */
        $scope.objectClassModel = {
            name:           "",
            metadataFields: []
        };
    	
        /**
		 * GET list of all object classes
		 * 
		 */
        $scope.getAllObjectClasses = function() {
        	objectClassService
                .getObjectClasses()
                .then(function (classes) {
                	$scope.allObjectClasses = classes;
                })
                .catch(function (response) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type":     "danger",
                        "text":     response.data
                    });
                });
        };
    	
    	
    	
            /**
             * list of options to choose the type of a metadata field from
             * @type {TYPE_OPTIONS|*}
             */
            $scope.typeOptions = TYPE_OPTIONS;



            /**
             * loads the form model if an existing class is being edited
             */
            $scope.loadSelectedClass = function(c) {
            	$scope.uiMode.newEntry=false;
            	$scope.uiMode.selectExisting=true;
            	$scope.uiMode.edit=true;
            	$scope.objectClassModel.name = c;
            	objectClassService
                        .getObjectClass($scope.objectClassModel.name)
                        .then(function (objectClass) {
                            $scope.objectClassModel = $filter('jsonSchema')(objectClass.schema, true);
                            console.log($scope.objectClassModel);
                        })
                        .catch(function (response) {
                        	$mdDialog.cancel();
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": "Could not load object class.<br/><br/>" + response.data,
                                "timeout": "never"
                            });
                        });
            };
            
            
            $scope.initNewClass = function() {
            	if(_.contains($scope.allObjectClasses, $scope.objectClassModel.name)) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "danger",
                        "text": "Object class already exists. Use a different name or edit the existing one.",
                        "timeout": "10000"
                    });          		
            		return;

            	}
            	$scope.uiMode.newEntry=true;
            	$scope.uiMode.selectExisting=false;
            	$scope.uiMode.edit=true;
            	$scope.addMetadataField();
            };

            /**
             * adds a metadata field to the form
             */
            $scope.addMetadataField = function() {
                $scope.objectClassModel.metadataFields.push(angular.copy(METADATA_FIELD_TEMPLATE));
            };

            /**
             * removes the given metadata field
             * @param {object} metadataField the field to remove
             */
            $scope.removeMetadataField = function(metadataField) {
                $scope.objectClassModel.metadataFields = _.reject($scope.objectClassModel.metadataFields, metadataField)
            };

            /**
             * returns true when there are no metadata fields loaded yet
             */
            $scope.isLoading = function() {
                return _.isEmpty($scope.objectClassModel.metadataFields);
            };

            /**
             * open a modal to ask if the old class shall be kept
             *
             * @param objectClass the new object class
             * @returns {promise} resolved or rejected to the plain response from the service
             */
            
            // Maybe activate this nice feature again?
            
//            var renameObjectClass = function(objectClass) {
//                // disable the loader animation as long as the modal is shown
//                $scope.isSubmissionPending = false;
//
//                return $uibModal
//                    .open({
//                        animation:      true,
//                        templateUrl:    "angular/modules/objectClass/renamingModal.html",
//                        controller:     "RenamingModalController",
//                        resolve:        {
//                            oldName: function() {
//                                return className;
//                            },
//                            newName: function() {
//                                return $scope.objectClassModel.name;
//                            }
//                        }
//                    })
//                    .result
//                    .then(function(keepOldClass) {
//                        // re-enable the loader animation, since now the actual submission will be performed
//                        $scope.isSubmissionPending = true;
//
//                        return objectClassService
//                            .createObjectClass(objectClass)
//                            .then(function() {
//                                return keepOldClass ? null : objectClassService.deleteObjectClass(className);
//                            });
//                    });
//            };

            /**
             * creates or updates the objectClass and closes the modal if successful
             */
            $scope.submitObjectClass = function() {
                $scope.isSubmissionPending = true;

                // assign the proper submit function
                // in edit mode, update if the class name is unchanged, else open the rename dialogue
                // in create mode, create a new class
                var submitFunction = $scope.uiMode.newEntry ? objectClassService.createObjectClass : objectClassService.updateObjectClass;
                		
                    //($scope.objectClassModel.name === className ? objectClassService.updateObjectClass : renameObjectClass)
                    //: objectClassService.createObjectClass;

                var objectClass = {
                    "name":   $scope.objectClassModel.name,
                    "schema": $filter('jsonSchema')($scope.objectClassModel)
                };

                $scope.$broadcast('clearMessageBag');

                submitFunction(objectClass)
                    .then(function() {
                    	//$uibModalInstance.close($scope.objectClassModel);
                    	$rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "created the object class!"
                        });
                    	$mdDialog.cancel();
                    })
                    .catch(function (response) {
                        if (response && response.data) {
                        	$rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": response.data,
                                "timeout": "never"
                            });
                        }
                        $scope.isSubmissionPending = false;
                    });
            };
            
            
            /**
    		 * GET list of all object classes
    		 * 
    		 */
            $scope.deleteObjectClass = function() {
            	objectClassService
                    .deleteObjectClass($scope.objectClassModel.name)
                    .then(function (data) {
                    	 $rootScope.$broadcast('FlashMessage', {
                             "type":     "success",
                             "text":     "deleted the object class: " + $scope.objectClassModel.name
                         });
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data
                        });
                    });
            	$mdDialog.cancel();
            };

            /**
             * cancels the operation and dismisses the modal
             */
            $scope.cancel = function () {
            	$mdDialog.cancel();
            };
            
            $scope.getAllObjectClasses();

        }]
);