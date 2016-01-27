'use strict';

/**
 * ContainerController
 * controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', '$timeout', 'containerService', 'fileSystemService', 'deleteConfirmationModal',
        function($scope, $rootScope, $stateParams, $timeout, containerService, fileSystemService, deleteConfirmationModal) {

            /**
             * contains the relevant information about the current container
             * @type {{name: string, objects: Array, metadata: object}}
             */
            $scope.container = {
                name:        $stateParams.containerName,
                objects:     [],
                metadata:    {}
            };

            /**
             * datePicker configuration
             * @type {{minDate: Date}}
             */
            $scope.datePicker = {

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
             * GET new objects from the container service
             *
             * @param {boolean} reload if true, the list will be reloaded from the beginning
             */
            $scope.getObjects = function(reload) {
                $scope.isGetObjectsRequestPending = true;
                containerService
                    .getObjects($scope.container, reload, $scope.prefix)
                    .then(function (response) {
                        $scope.container.objects = reload ? response.objects : $scope.container.objects.concat(response.objects);
                        $scope.container.metadata = response.metadata;
                        if (reload) {
                            // update the form model on reload only, since else mere scrolling could reset the form
                            $scope.container.objectClass = $scope.container.metadata.objectClass;
                        }
                        $scope.isGetObjectsRequestPending = false;
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data,
                            "timeout":  "never"
                        });
                        $scope.isGetObjectsRequestPending = false;
                    });
            };

            /**
             * PUT a container update to the file system service
             */
            $scope.updateContainer = function() {
                fileSystemService
                    .updateContainer($scope.container)
                    .then(function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Container updated."
                        });
                        $scope.container.metadata.objectClass = $scope.container.objectClass;
                        $scope.showContainerForm = false;
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data,
                            "timeout":  "never"
                        });
                    });
            };

            /**
             * checks if the container form input is different from the original values
             *
             * @returns {boolean} true, if the input is identical to the original values, else false
             */
            $scope.isContainerFormInputDifferent = function() {
                return $scope.container.objectClass !== $scope.container.metadata.objectClass;
            };

            /**
             * resets the container form
             */
            $scope.resetContainerForm = function() {
                $scope.showContainerForm = false;
                $scope.container.objectClass = $scope.container.metadata.objectClass;
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
                                    "text":     response.data,
                                    "timeout":  "never"
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
                    .uploadObject($scope.uploadForm.file, $scope.container.name, $scope.uploadForm.owner, $scope.uploadForm.retentionDate)
                    .then(
                        function() {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "success",
                                "text": "File \"" + $scope.uploadForm.file.name + "\" uploaded."
                            });

                            // hide upload Progress after 0.5s
                            $timeout(function() {
                                $scope.uploadProgress.percentage = 0;
                            }, 500);

                            // reload objects
                            $scope.getObjects(true);
                        },
                        function(response) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type":     "danger",
                                "text":     response.data,
                                "timeout":  "never"
                            });
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
             * toggles the details section for a given object
             *
             * @param {object} object the object to toggle the details for
             */
            $scope.toggleDetails = function(object) {
                // toggle details
                object.showDetails = !object.showDetails;

                // retrieve the details if they shall be shown
                if (object.showDetails) {
                    containerService
                        .getDetails($scope.container, object)
                        .then(function (details) {
                            object.details = details;
                        })
                        .catch(function (response) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type":     "danger",
                                "text":     response.data,
                                "timeout":  "never"
                            });
                        });
                }
            };

            // initial retrieval
            $scope.getObjects(true);
        }]);