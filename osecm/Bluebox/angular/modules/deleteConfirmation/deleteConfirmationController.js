'use strict';

/**
 * DeleteConfirmationController
 * controller for the modal content of the delete confirmation dialogue
 */
deleteConfirmationModule.controller('DeleteConfirmationController',
    ['$scope', 'item', function($scope, item) {

        /**
         * information about the item to delete
         * @type {{name: string, type: string}}
         */
        $scope.item = item;

        /**
         * confirms the deletion and closes the modal
         */
        $scope.confirm = function() {
            $uibModalInstance.close();
        };

        /**
         * cancels the deletion and dismisses the modal
         */
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }]
);