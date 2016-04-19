'use strict';

/**
 * FileSystemController controller for the container overview
 */
fileSystemModule.controller('FileSystemController',
		['$scope', '$rootScope', 'deleteConfirmationModal', 'fileSystemService', '$state', '$mdDialog', '$mdMedia',
		 function($scope, $rootScope, deleteConfirmationModal, fileSystemService, $state, $mdDialog, $mdMedia) {


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
			 * returns true, if there are no more containers to retrieve from
			 * the backend used to prevent further requests
			 * 
			 * @type {function}
			 */
			$scope.isEndOfListReached = fileSystemService.isEndOfListReached;


			/**
			 * GET new containers from the fileSystemService
			 * 
			 * @param {boolean}
			 *            reload if true, the list will be reloaded from the
			 *            beginning
			 */
			$scope.getContainers = function (reload) {

				var numCtsWeHave = $scope.fileSystem.containers.length;
				var lastCt = $scope.fileSystem.containers[numCtsWeHave - 1]; 
				var marker = lastCt ? lastCt.name : "";
				marker = reload ? "" : marker;

				if ($scope.isGetContainersRequestPending) return;
				$scope.isGetContainersRequestPending = true;


				fileSystemService.getContainers(reload, $scope.prefix, marker)
				.then(function(response) {
					$scope.fileSystem.containers = reload ? response.containers : $scope.fileSystem.containers.concat(response.containers);
					$scope.fileSystem.metadata = response.metadata;

					$scope.isGetContainersRequestPending = false;


					$scope.isAllDataLoaded = (response.metadata.containerCount == $scope.fileSystem.containers.length);



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
							$scope.getContainers(true);
							$scope.newContainer = undefined;
						})
						.catch(function (response) {
							$rootScope.$broadcast('FlashMessage', {
								"type":     "danger",
								"text":     response.data
							});
						});
			};
			
			
			/**
			 * enter a container --> we need to fix the routing; this is a workaround
			 */
			$scope.enterContainer = function(containerName) {
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
	$scope.enterContainer = function() {
		$mdDialog.hide();
		$state.go('containerState', {containerName: $scope.container.name});
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
		})
		.catch(function(response) {
			$rootScope.$broadcast('FlashMessage', {
				"type":     "danger",
				"text":     response.data
			});
		});
	};
};
