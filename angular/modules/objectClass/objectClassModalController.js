'use strict';

/**
 * ObjectClassModalController
 * controller for the object class form
 */
objectClassModule.controller('ObjectClassModalController',
    ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', '$filter', 'objectClassService', 'METADATA_FIELD_TEMPLATE', 'TYPE_OPTIONS', 'className',
        function($scope, $rootScope, $uibModalInstance, $uibModal, $filter, objectClassService, METADATA_FIELD_TEMPLATE, TYPE_OPTIONS, className) {

            /**
             * whether an existing object class is edited or a new one is created
             * @type {boolean}
             */
            $scope.isEditMode = className || false;

            /**
             * list of options to choose the type of a metadata field from
             * @type {TYPE_OPTIONS|*}
             */
            $scope.typeOptions = TYPE_OPTIONS;

            /**
             * the object class model that is being edited
             * @type {{name: string, metadataFields: Array}}
             */
            $scope.objectClassModel = {
                name:           className || "",
                metadataFields: []
            };

            /**
             * loads the form model if an existing class is being edited
             */
            var initialize = function() {
                if ($scope.isEditMode) {
                    objectClassService
                        .getObjectClass($scope.objectClassModel.name)
                        .then(function (objectClass) {
                            $scope.objectClassModel = $filter('jsonSchema')(objectClass.schema, true);
                        })
                        .catch(function (response) {
                            $uibModalInstance.dismiss();
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": "Could not load object class.<br/><br/>" + response.data,
                                "timeout": "never"
                            });
                        });
                } else {
                    $scope.addMetadataField();
                }
            };

            /**
             * adds a metadata field to the form
             */
            $scope.addMetadataField = function() {
                $scope.objectClassModel.metadataFields.push(angular.copy(METADATA_FIELD_TEMPLATE));
            };

            /**
             * removes the given metadata field
             * @param {object} metadataField the field to remove
             */
            $scope.removeMetadataField = function(metadataField) {
                $scope.objectClassModel.metadataFields = _.reject($scope.objectClassModel.metadataFields, metadataField)
            };

            /**
             * returns true when there are no metadata fields loaded yet
             */
            $scope.isLoading = function() {
                return _.isEmpty($scope.objectClassModel.metadataFields);
            };

            /**
             * open a modal to ask if the old class shall be kept
             *
             * @param objectClass the new object class
             * @returns {promise} resolved or rejected to the plain response from the service
             */
            var renameObjectClass = function(objectClass) {
                // disable the loader animation as long as the modal is shown
                $scope.isSubmissionPending = false;

                return $uibModal
                    .open({
                        animation:      true,
                        templateUrl:    "angular/modules/objectClass/renamingModal.html",
                        controller:     "RenamingModalController",
                        resolve:        {
                            oldName: function() {
                                return className;
                            },
                            newName: function() {
                                return $scope.objectClassModel.name;
                            }
                        }
                    })
                    .result
                    .then(function(keepOldClass) {
                        // re-enable the loader animation, since now the actual submission will be performed
                        $scope.isSubmissionPending = true;

                        return objectClassService
                            .createObjectClass(objectClass)
                            .then(function() {
                                return keepOldClass ? null : objectClassService.deleteObjectClass(className);
                            });
                    });
            };

            /**
             * creates or updates the objectClass and closes the modal if successful
             */
            $scope.submitObjectClass = function() {
                // TODO: check default value compatibility on change of input type
                $scope.isSubmissionPending = true;

                // assign the proper submit function
                // in edit mode, update if the class name is unchanged, else open the rename dialogue
                // in create mode, create a new class
                var submitFunction = $scope.isEditMode ?
                    ($scope.objectClassModel.name === className ? objectClassService.updateObjectClass : renameObjectClass)
                    : objectClassService.createObjectClass;

                var objectClass = {
                    "name":   $scope.objectClassModel.name,
                    "schema": $filter('jsonSchema')($scope.objectClassModel)
                };

                $scope.$broadcast('clearMessageBag');

                submitFunction(objectClass)
                    .then(function() {
                        $uibModalInstance.close($scope.objectClassModel);
                    })
                    .catch(function (response) {
                        if (response && response.data) {
                            $scope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": response.data,
                                "timeout": "never"
                            });
                        }
                        $scope.isSubmissionPending = false;
                    });
            };

            /**
             * cancels the operation and dismisses the modal
             */
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };

            initialize();
        }]
);