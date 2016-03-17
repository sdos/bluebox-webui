'use strict';

/**
 * RenamingModalController
 * controller for the modal content of the rename object class dialogue
 */
objectClassModule.controller('RenamingModalController',
    ['$scope', '$uibModalInstance', 'oldName', 'newName', function($scope, $uibModalInstance, oldName, newName) {

        /**
         * the old name of the object class to rename
         * @type {string}
         */
        $scope.oldName = oldName;

        /**
         * the new name of the object class to rename
         * @type {string}
         */
        $scope.newName = newName;

        /**
         * closes the modal with response value keepOldClass = true
         */
        $scope.keep = function() {
            $uibModalInstance.close(true);
        };

        /**
         * closes the modal with response value keepOldClass = false
         */
        $scope.delete = function() {
            $uibModalInstance.close(false);
        };

        /**
         * cancels the deletion and dismisses the modal
         */
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }]
);