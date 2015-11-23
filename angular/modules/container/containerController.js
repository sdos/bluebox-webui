'use strict';

/**
 * ContainerController
 * controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', 'containerService', function($scope, $rootScope, $stateParams, containerService) {

        /**
         * contains the relevant information about the current container
         * @type {{name: string, objects: Array, details: object, showDetails: boolean}}
         */
        $scope.container = {
            name:        $stateParams.containerName,
            objects:     [],
            details:     {},
            showDetails: false
        };

        /**
         * true, if we are currently waiting for an answer to a getObjects request
         * used to prevent multiple requests at once
         * @type {boolean}
         */
        $scope.isGetObjectsRequestPending = false;

        /**
         * true, if there are no more objects to retrieve from the backend
         * used to prevent further requests
         * @type {boolean}
         */
        $scope.isEndOfListReached = false;

        /**
         * GET new objects from the container service
         *
         * @param {boolean} reload if true, the list will be reloaded from the beginning
         */
        $scope.getObjects = function(reload) {
            $scope.isGetObjectsRequestPending = true;
            containerService.getObjects($scope.container.name, reload, $scope.prefix)
                .then(function (objects) {
                    $scope.isEndOfListReached = objects.length < 20;
                    $scope.container.objects = reload ? objects : $scope.container.objects.concat(objects);
                    $scope.isGetObjectsRequestPending = false;
                }, function (response) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "danger",
                        "text": response
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
                        // remove object from list
                        $scope.container.objects = _.reject($scope.container.objects, {name: object.name});
                    },
                    function(response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": response
                        });
                    });
        };

        /**
         * upload the file of the uploadForm
         */
        $scope.uploadObject = function() {
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
                            "type": "danger",
                            "text": response
                        });
                    });
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
                        },
                        function (response) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": response
                            });
                        });
            }
        };

        // initial retrieval
        $scope.getObjects(true);
    }]);