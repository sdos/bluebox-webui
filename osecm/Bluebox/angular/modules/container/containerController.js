'use strict';

/**
 * ContainerController controller for the view of a single container
 */
containerModule.controller('ContainerController',
		['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', 'containerService', 'fileSystemService', 'objectClassService', '$mdDialog', '$mdMedia',
		 function($scope, $rootScope, $state, $stateParams, $timeout, $filter, containerService, fileSystemService, objectClassService, $mdDialog, $mdMedia) {

			console.log("hello, ContainerController");

			/**
			 * ****************************************************************
			 * State
			 * 
			 * ****************************************************************
			 */



			$scope.isGetObjectsRequestPending = false;
			$scope.isAllDataLoaded = false;




			/**
			 * ****************************************************************
			 * Model
			 * 
			 * ****************************************************************
			 */



			/**
			 * 
			 * contains all available metadata field names for use in the table
			 * column selection. fields can come from: * filters * the document
			 * class of the container
			 * 
			 */


			$scope.availableMetadataFields = {"mgmt" :["retentiondate"]};
			$scope.availableInternalMetadataFields = ["bytes", "content_type", "last_modified", "hash"];

			$scope.selectedMetadataFields = [];
			$scope.selectedInternalMetadataFields = [];


			/**
			 * contains the relevant information about the current container
			 * 
			 * @type {{name: string, metadata: {objectClass: string,
			 *       objectCount: number}, metadataFields: Array, objects:
			 *       Array}}
			 */
			$scope.container = {
					name:           $stateParams.containerName,
					metadata:       {
						objectClass:    "",
						objectCount:    0
					},
					metadataFields: [],
					objects:        []
			};

			/**
			 * the form model for the container *
			 * 
			 * @type {{name: string, objectClass: string}}
			 */
			$scope.containerModel = {
					name:           $stateParams.containerName,
					objectClass:    ""
			};

			/**
			 * the form model for the file upload
			 * 
			 * @type {{file: null, retentionDate: null, metadata: {}}}
			 */
			$scope.fileModel = {
					file:          null,
					retentionDate: null,
					metadata:      {}
			};

			/**
			 * retentionDatePicker configuration
			 * 
			 * @type {{minDate: Date}}
			 */
			$scope.retentionDatePicker = {

					// past dates may not be entered
					minDate: new Date()
			};


			/**
			 * uploaded portion of the file in percent
			 * 
			 * @type {{loaded: number, total: number, percentage: number}}
			 */
			$scope.uploadProgress = {
					loaded:     0,
					total:      0,
					percentage: 0
			};

			/**
			 * list of special metadata fields that are not part of the object
			 * class, but shall possibly be shown in a column
			 * 
			 * @type {Array}
			 */
			$scope.specialMetadataFields = [
			                                {
			                                	headerKey: "date",
			                                	dateFormat: "medium"
			                                },
			                                {
			                                	headerKey: "last-modified",
			                                	dateFormat: "medium"
			                                },
			                                {
			                                	headerKey: "x-object-meta-mgmt-retentiondate",
			                                	dateFormat: "mediumDate"
			                                }
			                                ];


			/**
			 * ****************************************************************
			 * Model / Backend interaction
			 * 
			 * ****************************************************************
			 */


			/**
			 * GET new objects from the container service
			 * 
			 * @param {boolean}
			 *            reload if true, the list will be reloaded from the
			 *            beginning
			 */
			$scope.getObjects = function(reload) {

				if ($scope.isGetObjectsRequestPending) return;
				$scope.isGetObjectsRequestPending = true;

				var limit = 0;
				var marker = "";
				if (reload) {
					limit = Math.max($scope.container.objects.length, 30);
					limit = Math.min(limit, 100);
					marker = "";
				} else {
					limit = 30;
					marker = _.last($scope.container.objects) ? _.last($scope.container.objects).name : "";
				}


				containerService
				.getObjects($scope.container, $scope.prefix, marker, limit)
				.then(function (response) {

					// if the object class has changed
					if (response.metadata.objectClass !== $scope.container.metadata.objectClass) {

						// update the form model if it has not been changed
						// by the user
						if ($scope.isContainerModelInSync()) {
							$scope.containerModel.objectClass = response.metadata.objectClass;
						}

						getMetadataFields(response.metadata.objectClass);
					}


					$scope.container.objects = reload ? response.objects : $scope.container.objects.concat(response.objects);
					$scope.container.metadata = response.metadata;
					parseMetadataIntoModel();

					$scope.isGetObjectsRequestPending = false;

					$scope.isAllDataLoaded = ($scope.container.objects.length == response.metadata.objectCount);

					if ($scope.selectedMetadataFields.length > 0) {
						getAllMissingDetails();
					}
				})
				.catch(function (response) {
					if (401 == response.status) {
						$state.go('loginState', {noAuth: true});
						return;
					}
					if (response.status === 404) {
						$state.go('fileSystemState');
						$rootScope.$broadcast('FlashMessage', {
							"type": "danger",
							"text": "Container \"" + $scope.container.name + "\" not found."
						});
					} else {
						$rootScope.$broadcast('FlashMessage', {
							"type": "danger",
							"text": response.data
						});
					}
					$scope.isGetObjectsRequestPending = false;
				});
			};


			var parseMetadataIntoModel = function() {
				console.log($scope.container.metadata);
				var mdf = [];
				var mdfi = [];
				
				
				try {
					mdfi = JSON.parse($scope.container.metadata['x-container-meta-mdfi']);
				} catch (err) {
					console.log(err);
				}
				
				try {
					mdf = JSON.parse($scope.container.metadata['x-container-meta-mdf']);
				} catch (err) {
					console.log(err);
				}


				$scope.selectedMetadataFields = mdf;
				$scope.selectedInternalMetadataFields = mdfi;

			};




			
			
			/**
			 * PUT a container update to the file system service
			 */
			$scope.updateContainer = function() {
				fileSystemService
				.updateContainer({
					name:           $scope.container.name,
					objectClass:    $scope.containerModel.objectClass,
					mdfi:			$scope.selectedInternalMetadataFields,
					mdf:			$scope.selectedMetadataFields
				})
				.then(function() {
					$rootScope.$broadcast('FlashMessage', {
						"type": "success",
						"text": "Container updated."
					});
					$scope.container.metadata.objectClass = $scope.containerModel.objectClass;
					getMetadataFields($scope.containerModel.objectClass);
				})
				.catch(function (response) {
					$rootScope.$broadcast('FlashMessage', {
						"type":     "danger",
						"text":     response.data
					});
				});
			};


			/**
			 * PUT an object update
			 */
			$scope.updateObject = function() {
				containerService
				.updateObject($scope.container, $scope.object)
				.then(function() {
					$rootScope.$broadcast('FlashMessage', {
						"type": "success",
						"text": "Object updated."
					});
					getDetails($scope.object);
				})
				.catch(function (response) {
					$rootScope.$broadcast('FlashMessage', {
						"type":     "danger",
						"text":     response.data
					});
				});
			};

			




			/**
			 * upload the file of the uploadForm
			 */
			$scope.uploadObject = function() {
				for (var thisFile of $scope.fileModel.files) {
					
					thisFile.uploadProgress = {
							percentage : 0,
							loaded : 0,
							total : 0};
					containerService
					.uploadObject(thisFile, $scope.container.name, undefined, undefined)
					.then(
							function() {
								$rootScope.$broadcast('FlashMessage', {
									"type": "success",
									"text": "File \"" + thisFile.name + "\" uploaded."
								});
								resetProgressBar(thisFile);

								// reload objects
								$scope.getObjects(true);
							},
							function(response) {
								$rootScope.$broadcast('FlashMessage', {
									"type":     "danger",
									"text":     response.data
								});
								resetProgressBar(thisFile);
							},
							function(event) {
								// update upload progress
								thisFile.uploadProgress.loaded = parseInt(event.loaded);
								thisFile.uploadProgress.total = parseInt(event.total);
								thisFile.uploadProgress.percentage = parseInt(100.0 * event.loaded / event.total);
							}
					);

				}
			};

			/**
			 * resets the upload progress bar after 0.5s delay
			 */
			var resetProgressBar = function(thisFile) {
				$timeout(function() {
					thisFile.uploadProgress.percentage = 0;
				}, 500);
			};

			/**
			 * GET the details for an object
			 * 
			 * @param object
			 *            the object to get the details for
			 */
			var getDetails = function(object) {
				containerService
				.getDetails($scope.container, object)
				.then(function (details) {
					console.log(details);
					parseMetadataDates(details);
					object.details = details;
				})
				.catch(function (response) {
					$rootScope.$broadcast('FlashMessage', {
						"type":     "danger",
						"text":     response.data
					});
				});
			};


			/**
			 * GET the list of metadata fields
			 * 
			 */
			var getAvailableMetadataFields = function(object) {
				containerService
				.getAvailableMetadataFields()
				.then(function (fields) {
					$scope.availableMetadataFields = _.extend($scope.availableMetadataFields, fields);
					//console.log(fields);
				})
				.catch(function (response) {
					$rootScope.$broadcast('FlashMessage', {
						"type":     "danger",
						"text":     response.data
					});
				});
			};



			/**
			 * get the details for all objects that are missing them
			 */
			var getAllMissingDetails = function() {
				var objectsWithoutDetails = _.filter($scope.container.objects, function(object) {
					return !object.details;
				});
				angular.forEach(objectsWithoutDetails, getDetails);
			};


			// quit the container if there is no name provided
			if (!$stateParams.containerName) {
				$state.go('fileSystemState');
				$rootScope.$broadcast('FlashMessage', {
					"type": "danger",
					"text": "Cannot enter container: no container name provided."
				});
			} else {
				// initial retrieval
				$scope.getObjects(true);
				getAvailableMetadataFields();
				$scope.isInitialRetrievalDone = true;
			}






			/**
			 * ****************************************************************
			 * Legacy Object class handling...
			 * 
			 * ****************************************************************
			 */
			/**
			 * updates the metadata fields according to the given object class
			 * 
			 * @param {string}
			 *            objectClassName the name of the object class
			 */
			var getMetadataFields = function(objectClassName) {
				if (!objectClassName) {
					// if the object class has been unset, reset the metadata
					// fields
					$scope.container.metadataFields = [];
					$scope.fileModel.metadata = {};
				} else {
					// update the metadata fields
					$scope.isGetObjectClassRequestPending = true;
					objectClassService
					.getObjectClass(objectClassName)
					.then(function(objectClass) {
						$scope.isObjectClassOutdated = false;
						var metadataFields = $filter('jsonSchema')(objectClass.schema, true).metadataFields;
						setAdditionalPropertiesForMetadataFields(metadataFields);
						updateMetadataInputFields($scope.container.metadataFields, metadataFields);
						$scope.container.metadataFields = metadataFields;
						$scope.isGetObjectClassRequestPending = false;
					})
					.catch(function (response) {
						if (response.status === 404) {
							$scope.isObjectClassOutdated = true;
						} else {
							$rootScope.$broadcast('FlashMessage', {
								"type": "danger",
								"text": response.data
							});
						}
						$scope.isGetObjectClassRequestPending = false;
					});
				}
			};

			/**
			 * adds the following properties to metadata fields: - headerKey the
			 * HTTP header key by which the metadata value is provided -
			 * dateFormat for all metadata fields that tells how to display the
			 * date
			 * 
			 * @param metadataFields
			 *            an array of metadata fields
			 */
			var setAdditionalPropertiesForMetadataFields = function(metadataFields) {
				for (var i in metadataFields) {
					var metadataField = metadataFields[i];
					metadataField.headerKey = $filter("metadataHeaderField")(metadataField.name, $scope.container.metadata.objectClass);
					if (metadataField.type.inputType === 'date') {
						metadataField.dateFormat = "mediumDate";
					}
				}
			};

			/**
			 * checks if there is any metadata field that is required
			 * 
			 * @returns {boolean} true if there is at least one metadata field
			 *          that is required, else false
			 */
			$scope.isAnyMetadataFieldRequired = function() {
				return Boolean(_.findWhere($scope.container.metadataFields, {required: true}));
			};

			/**
			 * compares the new metadata fields with the old ones and updates
			 * the fileModel if necessary
			 * 
			 * @param {Array}
			 *            oldMetadataFields the old metadata fields
			 * @param {Array}
			 *            newMetadataFields the new metadata fields
			 */
			var updateMetadataInputFields = function(oldMetadataFields, newMetadataFields) {
				// check old metadata fields for stale ones to delete
				for (var i in oldMetadataFields) {
					var oldMetadataField = oldMetadataFields[i];
					var newMetadataField = _.findWhere(newMetadataFields, {name: oldMetadataField.name});
					if (!newMetadataField) {
						// if the field is no longer there, delete the input
						// model
						delete $scope.fileModel.metadata[oldMetadataField.name];
					}
				}

				// update the input model for relevant new metadata fields
				for (i in newMetadataFields) {
					newMetadataField = newMetadataFields[i];
					oldMetadataField = _.findWhere(oldMetadataFields, {name: newMetadataField.name});

					// if the field is new OR
					// if the field types are different OR
					// if the default value has changed and the user has not
					// interacted with it
					if (!oldMetadataField
							|| oldMetadataField.type.inputType !== newMetadataField.type.inputType
							|| (oldMetadataField.default !== newMetadataField.default && $scope.uploadForm[oldMetadataField.name].$pristine)
					) {
						// (re-)set the input model to the default value
						$scope.fileModel.metadata[newMetadataField.name] = newMetadataField.default;
					}
				}
			};
			/**
			 * checks if the container form model is in sync with the actual
			 * values
			 * 
			 * @returns {boolean} true, if the form model is identical to the
			 *          actual values, else false
			 */
			$scope.isContainerModelInSync = function() {
				return $scope.containerModel.objectClass === $scope.container.metadata.objectClass;
			};

			// update the metadata fields if the current class was modified
			$scope.$on('objectClassModified', function(event, objectClass) {
				// if it is the current object class of the container, update
				// the metadata fields
				if (objectClass.name === $scope.container.metadata.objectClass) {
					updateMetadataInputFields($scope.container.metadataFields, objectClass.metadataFields);
					$scope.container.metadataFields = objectClass.metadataFields;
				}
			});

			// reset metadata fields if a class has been deleted
			$scope.$on('objectClassDeleted', function() {
				// reset the metadata fields
				$scope.container.metadataFields = [];
				$scope.fileModel.metadata = {};
			});


			/**
			 * parses all dates in a metadata array to Date objects
			 * 
			 * @param {Array}
			 *            metadata the details of an object to be parsed
			 */
			var parseMetadataDates = function(metadata) {
				for (var key in metadata) {
					var metadataField = $scope.getMetadataField(key);
					if (metadataField && metadataField.dateFormat) {
						var parsedDate = new Date(metadata[key]);
						metadata[key] = isNaN(parsedDate) ? metadata[key] : parsedDate;
					}
				}
			};

			/**
			 * returns the metadata field (either special or custom) for a given
			 * HTTP header key
			 * 
			 * @param headerKey
			 *            the HTTP header key
			 */
			$scope.getMetadataField = function(headerKey) {
				return _.findWhere($scope.specialMetadataFields.concat($scope.container.metadataFields), {headerKey: headerKey})
			};


			/**
			 * ****************************************************************
			 * UI Components
			 * 
			 * ****************************************************************
			 */


			$scope.openColumnsMenu = function($mdOpenMenu, ev) {
				$mdOpenMenu(ev);
			};

			$scope.addMenuColumn = function(sourceName, columnName) {
				getAllMissingDetails();
				var fieldName = 'x-object-meta-' + sourceName + '-' + columnName;
				if(_.indexOf($scope.selectedMetadataFields, fieldName)<0) $scope.selectedMetadataFields.push(fieldName);
				$scope.updateContainer();
			};

			$scope.removeMenuColumn = function(columnName) {
				$scope.selectedMetadataFields = _.without($scope.selectedMetadataFields, columnName); 
				$scope.updateContainer();
			};

			$scope.removeInternalMenuColumn = function(columnName) {
				$scope.selectedInternalMetadataFields = _.without($scope.selectedInternalMetadataFields, columnName); 
				$scope.updateContainer();
			};

			$scope.addInternalMenuColumn = function(columnName) {
				if(_.indexOf($scope.selectedInternalMetadataFields, columnName)<0) $scope.selectedInternalMetadataFields.push(columnName);
				$scope.updateContainer();
			};





			/**
			 * 
			 * Detail Sheet...
			 * 
			 */
			 $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

			$scope.showDetailSheet = function(ev, row) {

				$scope.object = row;
				getDetails($scope.object);
				var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
				$mdDialog.show({
					controller: ContainerDialogController,
					templateUrl: 'angular/modules/container/detailSheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen,
					scope: $scope,
					preserveScope: true,
					locals: {containerService: containerService}
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










		}]);



function ContainerDialogController($rootScope, $state, $scope, $mdDialog, containerService) {


	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	/**
	 * DELETE an object from the container
	 * 
	 */
	$scope.deleteObject = function() {
		$mdDialog.cancel();
		containerService
		.deleteObject($scope.container, $scope.object)
		.then(function() {
			$rootScope.$broadcast('FlashMessage', {
				"type": "success",
				"text": "Object \"" + $scope.object.name + "\" deleted."
			});
			// update objectCount and remove object from
			// list
			$scope.container.metadata.objectCount--;
			$scope.container.objects = _.reject($scope.container.objects, $scope.object);
			delete $scope.object;
		})
		.catch(function (response) {
			$rootScope.$broadcast('FlashMessage', {
				"type":     "danger",
				"text":     response.data
			});
		});
	};
};

