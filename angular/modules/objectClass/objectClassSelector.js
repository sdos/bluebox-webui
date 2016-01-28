"use strict";

/**
 * objectClassSelector
 * directive for the object class selection input element
 */
objectClassModule.directive('objectClassSelector', function() {
    return {
        restrict:    'E',
        scope:       {
            ngModel:    '=',
            id:         '@'
        },
        templateUrl: "/angular/modules/objectClass/objectClassSelector.html",
        controller:  ['$scope', '$uibModal', '$rootScope', 'objectClassService', 'deleteConfirmationModal',
            function($scope, $uibModal, $rootScope, objectClassService, deleteConfirmationModal) {

                /**
                 * retrieves the object classes for the selector
                 */
                var getObjectClasses = function() {
                    objectClassService
                        .getObjectClasses()
                        .then(function(classes) {
                            $scope.objectClasses = classes;
                        });
                };

                /**
                 * opens a form to create a new object class
                 */
                $scope.createNewObjectClass = function() {
                    $scope.editObjectClass(true);
                };

                /**
                 * opens a form to edit the selected object class or create a new one
                 *
                 * @param isCreateMode if true, a new object class will be created
                 */
                $scope.editObjectClass = function(isCreateMode) {
                    if (!isCreateMode && !angular.isDefined($scope.ngModel)) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": "Could not edit object class: no object class selected."
                        });
                    } else {
                        $uibModal
                            .open({
                                animation: true,
                                size: "lg",
                                templateUrl: "/angular/modules/objectClass/objectClassModal.html",
                                controller: "ObjectClassModalController",
                                resolve: {
                                    className: function () {
                                        return isCreateMode ? undefined : $scope.ngModel;
                                    }
                                }
                            })
                            .result
                            .then(function (objectClass) {
                                var action = isCreateMode ? "created" : "updated";
                                $rootScope.$broadcast('FlashMessage', {
                                    "type": "success",
                                    "text": "Object class \"" + objectClass.name + "\" " + action + "."
                                });

                                // update selector options if class was created or renamed
                                if (isCreateMode || objectClass.name !== $scope.ngModel) {
                                    getObjectClasses();
                                    $scope.ngModel = objectClass.name;
                                }
                            });
                    }
                };

                /**
                 * deletes the selected object class
                 */
                $scope.deleteObjectClass = function() {
                    if (!angular.isDefined($scope.ngModel)) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": "Could not delete object class: no object class selected."
                        });
                    } else {
                        deleteConfirmationModal
                            .open($scope.ngModel, "object class")
                            .result
                            .then(function () {
                                return objectClassService
                                    .deleteObjectClass($scope.ngModel)
                                    .then(function () {
                                        $rootScope.$broadcast('FlashMessage', {
                                            "type": "success",
                                            "text": "Object class \"" + $scope.ngModel + "\" deleted."
                                        });
                                        // remove object class from list
                                        $scope.objectClasses = _.reject($scope.objectClasses, function(objectClass) {
                                            return objectClass === $scope.ngModel;
                                        });
                                    })
                                    .catch(function (response) {
                                        $rootScope.$broadcast('FlashMessage', {
                                            "type":     "danger",
                                            "text":     response.data,
                                            "timeout":  "never"
                                        });
                                    });
                            });
                    }
                };

                // initial retrieval
                getObjectClasses();
            }]
    };
});