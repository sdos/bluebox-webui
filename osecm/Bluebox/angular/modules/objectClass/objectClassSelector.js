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
        controller:  ['$scope', '$uibModal', '$rootScope', 'objectClassService',
            function($scope, $uibModal, $rootScope, objectClassService) {

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

                                // emit an event if class was modified
                                if (!isCreateMode) {
                                    $scope.$emit('objectClassModified', objectClass);
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
                        console.log("MISSING :(");
                    }
                };

                // initial retrieval
                getObjectClasses();
            }]
    };
});