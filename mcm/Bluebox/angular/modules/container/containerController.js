'use strict';

/**
 * ContainerController controller for the view of a single container
 */
containerModule.controller('ContainerController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', 'containerService', 'fileSystemService', 'objectClassService', '$mdDialog', '$mdMedia',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, containerService, fileSystemService, objectClassService, $mdDialog, $mdMedia) {

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


            $scope.availableMetadataFields = {"mgmt": ["retentiondate"]};
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
                name: $stateParams.containerName,
                metadata: {
                    objectCount: 0
                },
                metadataFields: [],
                objects: [],
                isSdos: false,
                isMeta: $filter('isMetaContainer')($stateParams.containerName)
            };

            /**
             * the form model for the file upload
             *
             * @type {{file: null, retentionDate: null, metadata: {}}}
             */
            $scope.fileModel = {
                files: null,
                retentionDate: null,
                metadata: {}
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
            $scope.getObjects = function (reload) {

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

                            //console.log(response.objects);
                            $scope.container.objects = reload ? response.objects : $scope.container.objects.concat(response.objects);
                            $scope.container.metadata = response.metadata;
                            parseMetadataIntoModel();

                            $scope.isGetObjectsRequestPending = false;

                            $scope.isAllDataLoaded = ($scope.container.objects.length == response.metadata.objectCount);

                            if ($scope.selectedMetadataFields.length > 0) {
                                getAllMissingDetails();
                            }
                        },
                        function (response) {
                            if (response.status === 404) {
                                $state.go('fileSystemState');
                                $rootScope.$broadcast('FlashMessage', {
                                    "type": "danger",
                                    "text": "Container \"" + $scope.container.name + "\" not found."
                                });
                            }
                            $scope.isGetObjectsRequestPending = false;
                        });
            };

            var parseObjectClassFieldsIntoColumnList = function () {
                var fields = [];
                for (var thisField in $scope.objectClassModel.metadataFields) {
                    var thisFieldValue = $scope.objectClassModel.metadataFields[thisField];
                    fields.push(thisFieldValue.name);
                }
                $scope.availableMetadataFields['class-' + $scope.objectClassModel.name] = fields;
                //console.log($scope.availableMetadataFields);
            };

            var getObjectClassData = function () {
                fileSystemService.getContainerMetadata($scope.container)
                    .then(function (response) {
                        var objectClass = response['x-container-meta-objectclass'];
                        if (objectClass) {
                            objectClassService.getObjectClass(objectClass)
                                .then(function (response) {
                                    $scope.objectClassModel = $filter('jsonSchema')(response.schema, true);
                                    parseObjectClassFieldsIntoColumnList();
                                    //console.log($scope.objectClassModel);
                                });
                        }

                    });
            };

            var parseMetadataIntoModel = function () {
                //console.log($scope.container.metadata);
                var mdf = [];
                var mdfi = [];


                try {
                    mdfi = JSON.parse($scope.container.metadata['x-container-meta-mdfi']);
                } catch (err) {
                    //console.log("no metadata field selection found, setting default");
                    mdfi = ["content_type", "bytes"];
                }

                try {
                    mdf = JSON.parse($scope.container.metadata['x-container-meta-mdf']);
                } catch (err) {
                    //console.log(err);
                }


                $scope.selectedMetadataFields = mdf;
                $scope.selectedInternalMetadataFields = mdfi;
                $scope.container.isSdos = $scope.container.metadata['x-container-meta-sdos'] == 'True';

            };


            /**
             * PUT a container update to the file system service
             * this is used for storing the selected table columns
             */
            $scope.updateContainer = function () {
                //console.log($scope.container);
                fileSystemService
                    .updateContainer({
                        name: $scope.container.name,
                        mdfi: $scope.selectedInternalMetadataFields,
                        mdf: $scope.selectedMetadataFields
                    })
                    .then(function () {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Container updated."
                        });
                    });
            };


            /**
             * PUT an object update
             */
            $scope.updateObject = function () {
                containerService
                    .updateObject($scope.container, $scope.object)
                    .then(function () {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "Object updated."
                        });
                        getDetails($scope.object);
                    });
            };

            $scope.uploadObjects = function () {
                $scope.uploadErrorOccurred = false;
                uploadObject(0);

            };


            /**
             * upload the file of the uploadForm
             */
            var uploadObject = function (myIdx) {
                if (myIdx >= $scope.fileModel.files.length) {
                    return;
                }
                var thisFile = $scope.fileModel.files[myIdx];
                thisFile.uploadProgress = {
                    percentage: 0,
                    loaded: 0,
                    total: 0,
                    hasError: false
                };
                containerService
                    .uploadObject(thisFile, $scope.container.name, $scope.fileModel.metadata, $scope.fileModel.retentionDate)
                    .then(
                        function () {
                            thisFile.uploadProgress.hasSuccess = true;
                        },
                        function (errorResponse) {
                            $scope.uploadErrorOccurred = true;
                            thisFile.uploadProgress.hasError = "Error: " + errorResponse.data;
                        },
                        function (event) {
                            // update upload progress
                            thisFile.uploadProgress.loaded = parseInt(event.loaded);
                            thisFile.uploadProgress.total = parseInt(event.total);
                            thisFile.uploadProgress.percentage = parseInt(100.0 * event.loaded / event.total);
                        }
                    );
                uploadObject(++myIdx);
            };

            /**
             * resets the upload list after success
             */
            $scope.resetUploadList = function () {
                $scope.fileModel.files = null;
                $scope.getObjects(true);
            };

            /**
             * GET the details for an object
             *
             * @param object
             *            the object to get the details for
             */
            var getDetails = function (object) {
                containerService
                    .getDetails($scope.container, object)
                    .then(function (details) {
                        //console.log(details);
                        parseMetadataDates(details);
                        object.details = details;
                    });
            };


            /**
             * GET the list of metadata fields
             *
             */
            var getAvailableMetadataFields = function (object) {
                containerService
                    .getAvailableMetadataFields()
                    .then(function (fields) {
                        $scope.availableMetadataFields = _.extend($scope.availableMetadataFields, fields);
                        //console.log(fields);
                    });
            };


            /**
             * get the details for all objects that are missing them
             */
            var getAllMissingDetails = function () {
                var objectsWithoutDetails = _.filter($scope.container.objects, function (object) {
                    return !object.details;
                });
                angular.forEach(objectsWithoutDetails, getDetails);
            };


            /**
             * parses all dates in a metadata array to Date objects
             *
             * @param {Array}
             *            metadata the details of an object to be parsed
             */
            var parseMetadataDates = function (metadata) {
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
            $scope.getMetadataField = function (headerKey) {
                return _.findWhere($scope.specialMetadataFields.concat($scope.container.metadataFields), {headerKey: headerKey})
            };


            /**
             * ****************************************************************
             * UI Components
             *
             * ****************************************************************
             */


            $scope.openColumnsMenu = function ($mdOpenMenu, ev) {
                $mdOpenMenu(ev);
            };

            $scope.addMenuColumn = function (sourceName, columnName) {
                getAllMissingDetails();
                var fieldPrefix = (sourceName == "mgmt") ? 'x-object-meta-' : 'x-object-meta-filter-'
                var fieldName = fieldPrefix + sourceName + '-' + columnName;
                if (_.indexOf($scope.selectedMetadataFields, fieldName) < 0) $scope.selectedMetadataFields.push(fieldName);
                $scope.updateContainer();
            };

            $scope.removeMenuColumn = function (columnName) {
                $scope.selectedMetadataFields = _.without($scope.selectedMetadataFields, columnName);
                $scope.updateContainer();
            };

            $scope.removeInternalMenuColumn = function (columnName) {
                $scope.selectedInternalMetadataFields = _.without($scope.selectedInternalMetadataFields, columnName);
                $scope.updateContainer();
            };

            $scope.addInternalMenuColumn = function (columnName) {
                if (_.indexOf($scope.selectedInternalMetadataFields, columnName) < 0) $scope.selectedInternalMetadataFields.push(columnName);
                $scope.updateContainer();
            };


            /**
             *
             * Detail Sheet...
             *
             */
            $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

            $scope.showDetailSheet = function (ev, row) {

                $scope.object = row;
                getDetails($scope.object);
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                $mdDialog.show({
                    controller: ContainerDialogController,
                    templateUrl: 'angular/modules/container/detailSheet.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    scope: $scope,
                    preserveScope: true,
                    locals: {containerService: containerService}
                });

                $scope.$watch(function () {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function (wantsFullScreen) {
                    $scope.customFullscreen = (wantsFullScreen === true);
                });
            };


            /**
             * ****************************************************************
             * Initialization
             *
             * ****************************************************************
             */


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
                getObjectClassData();
                getAvailableMetadataFields();
                $scope.isInitialRetrievalDone = true;
            }


        }]);


function ContainerDialogController($rootScope, $state, $scope, $mdDialog, containerService) {


    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    /**
     * DELETE an object from the container
     *
     */
    $scope.deleteObject = function () {
        $mdDialog.cancel();
        containerService
            .deleteObject($scope.container, $scope.object)
            .then(function () {
                $rootScope.$broadcast('FlashMessage', {
                    "type": "success",
                    "text": "Object \"" + $scope.object.name + "\" deleted."
                });
                // update objectCount and remove object from
                // list
                $scope.container.metadata.objectCount--;
                $scope.container.objects = _.reject($scope.container.objects, $scope.object);
                delete $scope.object;
            });
    };
}

