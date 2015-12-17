'use strict';

/**
 * bluebox.objectClass
 * module for the object class management
 */
var objectClassModule = angular.module('bluebox.objectClass', [
        'ui.bootstrap',
        'bluebox.dateInput',
        'bluebox.messageBag'
    ])

    .constant('TYPE_OPTIONS', [
        {
            name:       "Text",
            inputType:  "text"
        },
        {
            name:       "Number",
            inputType:  "number"
        },
        {
            name:       "Boolean",
            inputType:  "checkbox"
        },
        {
            name:       "Date",
            inputType:  "date"
        },
        {
            name:       "Email",
            inputType:  "email"
        },
        {
            name:       "URL",
            inputType:  "url"
        }
    ]);