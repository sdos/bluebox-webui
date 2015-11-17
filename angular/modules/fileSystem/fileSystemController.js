fileSystemModule.controller('FileSystemController',
    ['$scope', '$rootScope', 'fileSystemService', function($scope, $rootScope, fileSystemService) {
        $scope.containers = [];
        $scope.messages = [];

        $scope.updateContainers = function () {
            fileSystemService.getContainers()
                .then(function (containers) {
                    $scope.containers = containers;
                }, function (response) {
                    console.error(response);
                });
        };

        $scope.createContainer = function() {
            fileSystemService.createContainer($scope.containerName)
                .then(
                    function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Container \"" + $scope.containerName + "\" created."
                        });
                        $scope.updateContainers();
                    },
                    function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": response
                        });
                    });
        };

        $scope.updateContainers();
    }]);