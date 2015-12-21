'use strict';

/**
 * bluebox.dateInput
 * module and directive that provides a date input field with a date picker
 */
angular.module('bluebox.dateInput', [
        'ui.bootstrap'
    ])
    .config(['uibDatepickerConfig', function(uibDatepickerConfig) {
        // set starting day of the week to monday
        uibDatepickerConfig.startingDay = 1;
    }])

    .directive('dateInput', function() {
        return {
            restrict:       'E',
            scope:          {
                model:      '=',
                id:         '@',
                minDate:    '=',
                options:    '='
            },
            templateUrl:    '/angular/modules/dateInput/dateInput.html'
        };
    });