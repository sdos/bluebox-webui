'use strict';

/**
 * FileSystemController
 * controller for the container overview
 */
fileSystemModule.controller('FileSystemController',
    ['$scope', '$rootScope', 'deleteConfirmationModal', 'fileSystemService', '$state',
        function($scope, $rootScope, deleteConfirmationModal, fileSystemService, $state) {
    	
    	
    	
    	
    	  $scope.containerTableOptions = {
    	            headerHeight: 50,
    	            rowHeight: 50,
    	            scrollbarV: false,
    	            footerHeight: 50,
    	            columnMode: 'force',     
    	            columns: [
    	              { name: "Name", prop: "name", },
    	              { name: "Bytes", prop: "bytes", },
    	              { name: "Number of Objects", prop: "count" }
    	            ]
    	          };
    	

            /**
             * contains the relevant information about the containers
             * @type {{containers: Array, metadata: object}}
             */
            $scope.fileSystem = {
                containers: [],
                metadata:   {}
            };

            /**
             * true, if we are currently waiting for an answer to a getContainers request
             * used to prevent multiple requests at once
             * @type {boolean}
             */
            $scope.isGetContainersRequestPending = false;

            /**
             * returns true, if there are no more containers to retrieve from the backend
             * used to prevent further requests
             * @type {function}
             */
            $scope.isEndOfListReached = fileSystemService.isEndOfListReached;

            
            $scope.enterContainer = function (params) {
            	
            	console.log(params);
            	$state.go('containerState', params);
            	};
            
            
            /**
             * GET new containers from the fileSystemService
             *
             * @param {boolean} reload if true, the list will be reloaded from the beginning
             */
            $scope.getContainers = function (reload) {
                $scope.isGetContainersRequestPending = true;
                fileSystemService.getContainers(reload, $scope.prefix)
                    .then(function(response) {
                        $scope.fileSystem.containers = reload ? response.containers : $scope.fileSystem.containers.concat(response.containers);
                        $scope.fileSystem.metadata = response.metadata;
                        $scope.isGetContainersRequestPending = false;
                    })
                    .catch(function (response) {
                    	$scope.isGetContainersRequestPending = false;
                    	if (401 == response.status) {
                    		$state.go('loginState', {noAuth: true});
                    		return;
                    	}
                    	
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "warning",
                            "text":     response.data
                        });
                        
                    });
            };

            /**
             * create a new container by the name entered in the form
             */
            $scope.createContainer = function() {
                fileSystemService.createContainer($scope.container)
                    .then(
                        function () {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "success",
                                "text": "Container \"" + $scope.container.name + "\" created."
                            });
                            // reload containers
                            $scope.getContainers(true);
                        })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data
                        });
                    });
            };

            /**
             * DELETE a container
             *
             * @param {object} container the container to delete
             */
            $scope.deleteContainer = function(container) {
                deleteConfirmationModal
                    .open(container.name, "container")
                    .result
                    .then(function() {
                        return fileSystemService.deleteContainer(container)
                            .then(function() {
                                $rootScope.$broadcast('FlashMessage', {
                                    "type": "success",
                                    "text": "Container \"" + container.name + "\" deleted."
                                });
                                // update metadata and remove object from list
                                $scope.fileSystem.metadata.containerCount--;
                                $scope.fileSystem.metadata.objectCount -= container.count;
                                $scope.fileSystem.containers = _.reject($scope.fileSystem.containers, container);
                            })
                            .catch(function(response) {
                                $rootScope.$broadcast('FlashMessage', {
                                    "type":     "danger",
                                    "text":     response.data
                                });
                            });
                    });
            };

            // initial retrieval
            $scope.getContainers(true);
        }]);