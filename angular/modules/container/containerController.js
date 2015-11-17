'use strict';

containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', 'containerService', function($scope, $rootScope, $stateParams, containerService) {
        $scope.containerName = $stateParams.containerName;

        $scope.containerObjects = [];
        $scope.messages = [];

        $scope.updateContainerObjects = function () {
            containerService.getObjectsInContainer($scope.containerName)
                .then(function (containerObjects) {
                    $scope.containerObjects = containerObjects;
                }, function (response) {
                    console.error(response);
                });
        };

        $scope.deleteObject = function(objectName) {
            containerService.deleteObject($scope.containerName, objectName)
                .then(function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Object \"" + objectName + "\" deleted."
                        });
                        $scope.containerObjects = _.reject($scope.containerObjects, {name: objectName});
                    },
                    function(response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": response
                        });
                    });
        };

        $scope.upload = function() {
            containerService.upload($scope.file, $scope.containerName, $scope.ownerName, $scope.retentionDate)
                .then(
                    function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "File \"" + $scope.file.name + "\" uploaded."
                        });
                        $scope.updateContainerObjects();
                    },
                    function(response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": response
                        });
                    });
        };

        $scope.updateContainerObjects();
    }]);