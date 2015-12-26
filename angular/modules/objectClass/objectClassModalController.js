'use strict';

/**
 * ObjectClassModalController
 * controller for the object class form
 */
objectClassModule.controller('ObjectClassModalController',
    ['$scope', '$uibModalInstance', 'objectClassService', 'TYPE_OPTIONS',
        function($scope, $uibModalInstance, objectClassService, TYPE_OPTIONS) {

            var metadataField = {
                "name":       "",
                "type":       "",
                "default":    "",
                "required":   false
            };

            /**
             * list of options to choose the type of a metadata field from
             * @type {TYPE_OPTIONS|*}
             */
            $scope.typeOptions = TYPE_OPTIONS;

            /**
             * the object class model that is being edited
             * @type {{name: string, metadataFields: Array}}
             */
            $scope.objectClass = {
                name:           "",
                metadataFields: [angular.copy(metadataField)]
            };

            /**
             * adds a metadata field to the form
             */
            $scope.addMetadataField = function() {
                $scope.objectClass.metadataFields.push(angular.copy(metadataField));
            };

            /**
             * removes the given metadata field
             * @param {object} metadataField the field to remove
             */
            $scope.removeMetadataField = function(metadataField) {
                $scope.objectClass.metadataFields = _.reject($scope.objectClass.metadataFields, metadataField)
            };

            /**
             * creates the new objectClass and closes the modal if successful
             */
            $scope.createObjectClass = function() {
                $scope.$broadcast('clearMessageBag');
                objectClassService
                    .createObjectClass($scope.objectClass)
                    .then(function() {
                        $uibModalInstance.close($scope.objectClass);
                    })
                    .catch(function (response) {
                        $scope.$broadcast('FlashMessage', {
                            "type":     "danger",
                            "text":     response.data,
                            "timeout":  "never"
                        });
                    });
            };

            /**
             * cancels the operation and dismisses the modal
             */
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]
);