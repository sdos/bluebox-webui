'use strict';

/**
 * ContainerController
 * controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', 'containerService', function($scope, $rootScope, $stateParams, containerService) {

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
         * @type {number}
         */
        $scope.uploadProgressPercentage = 0;

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
                        "text":     response,
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
                        "text":     response,
                        "timeout":  "never"
                    });
                });
        };

        /**
         * upload the file of the uploadForm
         */
        $scope.uploadObject = function() {
            $scope.uploadProgressPercentage = 0;
            containerService.uploadObject($scope.uploadForm.file, $scope.container.name, $scope.uploadForm.owner, $scope.uploadForm.retentionDate)
                .then(
                    function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "File \"" + $scope.uploadForm.file.name + "\" uploaded."
                        });
                        // reload objects
                        $scope.getObjects(true);
                    },
                    function(response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response,
                            "timeout":  "never"
                        });
                    },
                    function(event) {
                        $scope.uploadProgressPercentage = parseInt(100.0 * event.loaded / event.total);
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
                            "text":     response,
                            "timeout":  "never"
                        });
                    });
            }
        };

        // initial retrieval
        $scope.getObjects(true);
    }]);