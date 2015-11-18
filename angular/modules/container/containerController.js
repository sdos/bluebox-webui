'use strict';

containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$stateParams', 'containerService', function($scope, $rootScope, $stateParams, containerService) {
        $scope.container = {
            name:    $stateParams.containerName,
            objects: []
        };

        $scope.isGetObjectsRequestPending = false;
        $scope.isEndOfListReached = false;

        $scope.getObjects = function(reload) {
            $scope.isGetObjectsRequestPending = true;
            containerService.getObjects($scope.container.name, reload)
                .then(function (objects) {
                    $scope.isEndOfListReached = objects.length < 20;
                    $scope.container.objects = reload ? objects : $scope.container.objects.concat(objects);
                    $scope.isGetObjectsRequestPending = false;
                }, function (response) {
                    console.error(response);
                    $scope.isGetObjectsRequestPending = false;
                });
        };

        $scope.deleteObject = function(objectName) {
            containerService.deleteObject($scope.container.name, objectName)
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

        $scope.uploadObject = function() {
            containerService.uploadObject($scope.file, $scope.container.name, $scope.ownerName, $scope.retentionDate)
                .then(
                    function() {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "File \"" + $scope.file.name + "\" uploaded."
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

        $scope.getObjects(true);
    }]);