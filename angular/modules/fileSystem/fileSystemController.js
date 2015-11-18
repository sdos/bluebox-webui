fileSystemModule.controller('FileSystemController',
    ['$scope', '$rootScope', 'fileSystemService', function($scope, $rootScope, fileSystemService) {
        $scope.containers = [];
        $scope.isGetContainersRequestPending = false;
        $scope.isEndOfListReached = false;

        $scope.getContainers = function (reload) {
            $scope.isGetContainersRequestPending = true;
            fileSystemService.getContainers(reload)
                .then(function (containers) {
                    $scope.isEndOfListReached = containers.length < 20;
                    $scope.containers = reload ? containers : $scope.containers.concat(containers);
                    $scope.isGetContainersRequestPending = false;
                }, function (response) {
                    console.error(response);
                    $scope.isGetContainersRequestPending = false;
                });
        };

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

        $scope.getContainers();
    }]);