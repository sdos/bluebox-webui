'use strict';

/**
 * FileSystemController controller for the container overview
 */
fileSystemModule.controller('FileSystemController',
		['$scope', '$rootScope', 'fileSystemService', '$state', '$mdDialog', '$mdMedia',
		 function($scope, $rootScope, fileSystemService, $state, $mdDialog, $mdMedia) {

			console.log("hello, FileSystemController");

			$scope.isAllDataLoaded = false;


			/**
			 * contains the relevant information about the containers
			 * 
			 * @type {{containers: Array, metadata: object}}
			 */
			$scope.fileSystem = {
					containers: [],
					metadata:   {}
			};

			/**
			 * true, if we are currently waiting for an answer to a
			 * getContainers request used to prevent multiple requests at once
			 * 
			 * @type {boolean}
			 */
			$scope.isGetContainersRequestPending = false;

			/**
			 * GET new containers from the fileSystemService
			 * 
			 * @param {boolean}
			 *            reload if true, the list will be reloaded from the
			 *            beginning
			 */
			$scope.getContainers = function (reload) {

				if ($scope.isGetContainersRequestPending) return;
				$scope.isGetContainersRequestPending = true;

				var limit = 0;
				var marker = "";
				if (reload) {
					limit = Math.max($scope.fileSystem.containers.length, 30);
					limit = Math.min(limit, 100);
					marker = "";
				} else {
					limit = 30;
					marker = _.last($scope.fileSystem.containers) ? _.last($scope.fileSystem.containers).name : "";
				}

				fileSystemService.getContainers($scope.prefix, marker, limit)
				.then(function(response) {
					$scope.fileSystem.containers = reload ? response.containers : $scope.fileSystem.containers.concat(response.containers);
					$scope.fileSystem.metadata = response.metadata;
					$scope.isGetContainersRequestPending = false;
					$scope.isAllDataLoaded = (0 === response.containers.length);
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
				fileSystemService.createContainer($scope.newContainer)
				.then(
						function () {
							$rootScope.$broadcast('FlashMessage', {
								"type": "success",
								"text": "Container \"" + $scope.newContainer.name + "\" created."
							});
							// reload containers
							$scope.newContainer = undefined;
							setTimeout(function() {

								$scope.getContainers(true);

							}, 200);
						})
						.catch(function (response) {
							$rootScope.$broadcast('FlashMessage', {
								"type":     "danger",
								"text":     response.data
							});
						});
			};
			
			
            /**
			 * GET the details for a container
			 * 
			 */
            var getContainerMetadata = function(container) {
            	fileSystemService
                    .getContainerMetadata(container)
                    .then(function (metadata) {
                        container.metadata = metadata;
                    })
                    .catch(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data
                        });
                    });
            };
			
			
			
			
			
			
			
			
			


			/**
			 * enter a container --> we need to fix the routing; this is a
			 * workaround
			 */
			$scope.enterContainer = function(containerName) {
				$mdDialog.hide();
				$state.go('containerState', {containerName: containerName});
			};




			/**
			 * 
			 * Detail Sheet...
			 * 
			 */
			$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
			
			$scope.showDetailSheet = function(ev, row) {
				
				$scope.container = row;
				getContainerMetadata($scope.container);
				var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
				$mdDialog.show({
					controller: DialogController,
					templateUrl: 'angular/modules/fileSystem/detailSheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen,
					scope: $scope,
					preserveScope: true,
					locals: {fileSystemService: fileSystemService}
				})
				.then(
						function() {
							console.log('You cancelled the dialog.');
						});
				
				$scope.$watch(function() {
					return $mdMedia('xs') || $mdMedia('sm');
				}, function(wantsFullScreen) {
					$scope.customFullscreen = (wantsFullScreen === true);
				});
			};
			/**
			 * 
			 * Create container sheet
			 * 
			 */
			$scope.showCreateContainerSheet = function(ev, row) {
				
				var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
				$mdDialog.show({
					controller: DialogController,
					templateUrl: 'angular/modules/fileSystem/createContainerSheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen,
					scope: $scope,
					preserveScope: true
				})
				.then(
						function() {
							console.log('You cancelled the dialog.');
						});
				
				$scope.$watch(function() {
					return $mdMedia('xs') || $mdMedia('sm');
				}, function(wantsFullScreen) {
					$scope.customFullscreen = (wantsFullScreen === true);
				});
			};
			/**
			 * 
			 * Manage Object Class Sheet
			 * 
			 */
			$scope.showObjectClassSheet = function(ev, row) {

				var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
				$mdDialog.show({
					controller: ObjectClassModalController,
					templateUrl: 'angular/modules/objectClass/objectClassSheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen,
					scope: $scope,
					preserveScope: true
				})
				.then(
						function() {
							console.log('You cancelled the dialog.');
						});

				$scope.$watch(function() {
					return $mdMedia('xs') || $mdMedia('sm');
				}, function(wantsFullScreen) {
					$scope.customFullscreen = (wantsFullScreen === true);
				});
			};








			// initial retrieval
			$scope.getContainers(true);
		}]);

function DialogController($rootScope, $state, $scope, $mdDialog, fileSystemService) {


	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.deleteContainer = function() {
		$mdDialog.cancel();
		fileSystemService.deleteContainer($scope.container)
		.then(function() {
			$rootScope.$broadcast('FlashMessage', {
				"type": "success",
				"text": "Container \"" + $scope.container.name + "\" deleted."
			});
			// update metadata and remove object from list
			$scope.fileSystem.metadata.containerCount--;
			$scope.fileSystem.metadata.objectCount -= $scope.container.count;
			$scope.fileSystem.containers = _.reject($scope.fileSystem.containers, $scope.container);
			delete $scope.container;
		})
		.catch(function(response) {
			$rootScope.$broadcast('FlashMessage', {
				"type":     "danger",
				"text":     response.data
			});
		});
	};
};
