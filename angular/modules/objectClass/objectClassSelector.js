"use strict";

/**
 * objectClassSelector
 * directive for the object class selection input element
 */
objectClassModule.directive('objectClassSelector', function() {
    return {
        restrict:    'E',
        scope:       {
            model:  '=',
            id:     '@'
        },
        templateUrl: "/angular/modules/objectClass/objectClassSelector.html",
        controller:  ['$scope', '$uibModal', '$rootScope', 'objectClassService', 'deleteConfirmationModal',
            function($scope, $uibModal, $rootScope, objectClassService, deleteConfirmationModal) {

                // initial retrieval
                objectClassService
                    .getObjectClasses()
                    .then(function(response) {
                        $scope.objectClasses = response.objectClasses;
                    });

                /**
                 * opens a form to create a new object class
                 */
                $scope.createNewObjectClass = function() {
                    $uibModal.open({
                        animation:      true,
                        size:           "lg",
                        templateUrl:    "/angular/modules/objectClass/objectClassModal.html",
                        controller:     "ObjectClassModalController"
                    });
                };

                /**
                 * deletes the selected object class
                 */
                $scope.deleteObjectClass = function() {
                    if (!angular.isDefined($scope.model)) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": "Could not delete object class: no object class selected."
                        });
                    } else {
                        deleteConfirmationModal
                            .open($scope.model.name, "object class")
                            .result
                            .then(function () {
                                return objectClassService
                                    .deleteObjectClass($scope.model)
                                    .then(function () {
                                        $rootScope.$broadcast('FlashMessage', {
                                            "type": "success",
                                            "text": "Object class \"" + $scope.model.name + "\" deleted."
                                        });
                                        // remove object class from list
                                        $scope.objectClasses = _.reject($scope.objectClasses, $scope.model);
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
            }]
    };
});