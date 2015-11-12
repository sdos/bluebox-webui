fileSystemModule.controller('FileSystemController',
    ['$scope', 'fileSystemService', function($scope, fileSystemService) {
        $scope.containers = [];

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
                    $scope.updateContainers,
                    function (response) {
                        console.error(response);
                    });
        };

        $scope.updateContainers();
    }]);