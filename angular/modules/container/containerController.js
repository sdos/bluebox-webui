'use strict';

/**
 * ContainerController
 * controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', '$timeout', 'containerService',
        function($scope, $rootScope, $stateParams, $timeout, containerService) {

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
             * @type {{opened: boolean, today: Date, options: object, toggle: function}}
             */
            $scope.datePicker = {
                isOpen: false,

                // past dates may not be entered
                minDate: new Date(),

                options: {
                    // start the week on monday
                    startingDay: 1
                },

                /**
                 * toggles the datePicker popup
                 */
                toggle: function() {
                    $scope.datePicker.isOpen = !$scope.datePicker.isOpen;
                }
            };

            /**
             * true, if we are currently waiting for an answer to a getObjects request
             * used to prevent multiple requests at once
             * @type {boolean}
             */
            $scope.isGetObjectsRequestPending = false;

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
                containerService.getObjects($scope.container.name, reload, $scope.prefix)
                    .then(function (response) {
                        $scope.container.objects = reload ? response.objects : $scope.container.objects.concat(response.objects);
                        $scope.container.metadata = response.metadata;
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
             * DELETE an object from the container
             *
             * @param {object} object the object to delete
             */
            $scope.deleteObject = function(object) {
                containerService.deleteObject($scope.container.name, object.name)
                    .then(function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Object \"" + object.name + "\" deleted."
                        });
                        // update objectCount and remove object from list
                        $scope.container.metadata.objectCount--;
                        $scope.container.objects = _.reject($scope.container.objects, {name: object.name});
                    })
                    .catch(function(response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data,
                            "timeout":  "never"
                        });
                    });
            };

            /**
             * upload the file of the uploadForm
             */
            $scope.uploadObject = function() {
                $scope.uploadProgress.percentage = 0;
                containerService.uploadObject($scope.uploadForm.file, $scope.container.name, $scope.uploadForm.owner, $scope.uploadForm.retentionDate)
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
                    containerService.getDetails($scope.container.name, object.name)
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