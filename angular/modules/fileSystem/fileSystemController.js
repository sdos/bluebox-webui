'use strict';

/**
 * FileSystemController
 * controller for the container overview
 */
fileSystemModule.controller('FileSystemController',
    ['$scope', '$rootScope', 'fileSystemService', function($scope, $rootScope, fileSystemService) {

        /**
         * the currently loaded containers
         * @type {Array}
         */
        $scope.containers = [];

        /**
         * true, if we are currently waiting for an answer to a getContainers request
         * used to prevent multiple requests at once
         * @type {boolean}
         */
        $scope.isGetContainersRequestPending = false;

        /**
         * true, if there are no more containers to retrieve from the backend
         * used to prevent further requests
         * @type {boolean}
         */
        $scope.isEndOfListReached = false;

        /**
         * GET new containers from the fileSystemService
         *
         * @param {boolean} reload if true, the list will be reloaded from the beginning
         */
        $scope.getContainers = function (reload) {
            $scope.isGetContainersRequestPending = true;
            fileSystemService.getContainers(reload, $scope.prefix)
                .then(function (containers) {
                    $scope.isEndOfListReached = containers.length < 20;
                    $scope.containers = reload ? containers : $scope.containers.concat(containers);
                    $scope.isGetContainersRequestPending = false;
                }, function (response) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "danger",
                        "text": response
                    });
                    $scope.isGetContainersRequestPending = false;
                });
        };

        /**
         * create a new container by the name entered in the form
         */
        $scope.createContainer = function() {
            fileSystemService.createContainer($scope.containerName)
                .then(
                    function () {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Container \"" + $scope.containerName + "\" created."
                        });
                        // reload containers
                        $scope.getContainers(true);
                    },
                    function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": response
                        });
                    });
        };

        // initial retrieval
        $scope.getContainers(true);
    }]);