'use strict';

/**
 * dynamicInput
 * directive that provides an input field of a dynamic type
 */
objectClassModule.directive('dynamicInput', function() {
    return {
        restrict:       'E',
        scope:          {
            type:        '=',
            ngModel:     '=',
            ngRequired:  '=',
            name:        '@',
            id:          '@',
            placeholder: '@',
            inline:      '='
        },
        templateUrl:    '/angular/modules/objectClass/dynamicInput.html'
    };
});