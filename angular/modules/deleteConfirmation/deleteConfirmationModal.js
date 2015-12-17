'use strict';

/**
 * deleteConfirmationModal
 * modal that shows a delete confirmation dialogue
 * for information on how to handle the returned modal, see https://angular-ui.github.io/bootstrap/#/modal
 */
deleteConfirmationModule.factory(
    'deleteConfirmationModal',
    ['$uibModal', function($uibModal) {
        return {

            /**
             * opens a delete confirmation modal
             *
             * @param {string} name the name of the object to delete
             * @param {string} type the type the object is of
             * @returns {*|Window} the $uibModalInstance
             */
            open: function(name, type) {
                return $uibModal.open({
                    animation:      true,
                    templateUrl:    "angular/modules/deleteConfirmation/deleteConfirmationModal.html",
                    controller:     "DeleteConfirmationController",
                    resolve:        {
                        item: function() {
                            return {
                                name: name,
                                type: type
                            }
                        }
                    }
                })
            }
        };
    }]
);