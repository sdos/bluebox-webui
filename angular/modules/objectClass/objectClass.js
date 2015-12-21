'use strict';

/**
 * bluebox.objectClass
 * module for the object class management
 */
var objectClassModule = angular.module('bluebox.objectClass', [
        'ui.bootstrap',
        'bluebox.dateInput',
        'bluebox.deleteConfirmation',
        'bluebox.filter',
        'bluebox.messageBag'
    ])

    .constant('TYPE_OPTIONS', [
        {
            name:       "Text",
            inputType:  "text",
            jsonSchema: {
                type: "string"
            }
        },
        {
            name:       "Number",
            inputType:  "number",
            jsonSchema: {
                type: "number"
            }
        },
        {
            name:       "Boolean",
            inputType:  "checkbox",
            jsonSchema: {
                type: "boolean"
            }
        },
        {
            name:       "Date",
            inputType:  "date",
            jsonSchema: {
                type: "string",
                format: "date-time"
            }
        },
        {
            name:       "Email",
            inputType:  "email",
            jsonSchema: {
                type: "string",
                format: "email"
            }
        },
        {
            name:       "URL",
            inputType:  "url",
            jsonSchema: {
                type: "string",
                format: "uri"
            }
        }
    ]);