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
        controller:  ['$scope', '$uibModal', 'objectClassService', function($scope, $uibModal, objectClassService) {

            // initial retrieval
            objectClassService
                .getObjectClasses()
                .then(function(response) {
                    $scope.objectClasses = response.objectClasses;
                });

            /**
             * opens a form to create a new object class
             */
            $scope.createNewClass = function() {
                $uibModal.open({
                    animation:      true,
                    size:           "lg",
                    templateUrl:    "/angular/modules/objectClass/objectClassModal.html",
                    controller:     "ObjectClassModalController"
                });
            }
        }]
    };
});