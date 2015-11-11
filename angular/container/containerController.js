'use strict';

containerModule.controller('ContainerController',
    ['$scope', '$stateParams', 'containerService', function($scope, $stateParams, containerService) {
        $scope.containerName = $stateParams.containerName;

        $scope.containerObjects = [];

        $scope.updateContainerObjects = function () {
            containerService.getObjectsInContainer($scope.containerName)
                .then(function (containerObjects) {
                    angular.extend($scope.containerObjects, containerObjects);
                }, function (response) {
                    console.error(response);
                });
        };

        $scope.deleteObject = function(objectName) {
            containerService.deleteObject($scope.containerName, objectName)
                .then(
                    $scope.updateContainerObjects,
                    function(response) {
                        console.error(response);
                    });
        };

        $scope.upload = function() {
            containerService.upload($scope.file, $scope.containerName, $scope.ownerName, $scope.retentionDate)
                .then(
                    $scope.updateContainerObjects,
                    function(response) {
                        console.error(response);
                    });
        };

        $scope.updateContainerObjects();
    }]);