'use strict';

/**
 * bluebox.objectClass
 * module for the object class management
 */
var objectClassModule = angular.module('bluebox.objectClass', [
        'bluebox.filter'
    ])
    /**
     * the template for the form model of a metadata field
     */
    .constant('METADATA_FIELD_TEMPLATE', {
        "name":       "",
        "type":       "",
        "default":    undefined,
        "required":   false
    })

    /**
     * available options for the type of a metadata field
     *
     * properties of a type option:
     *  - {string}                                   name       the name of the type as it is shown in the drop down
     *  - {string}                                   inputType  the corresponding HTML5 input type
     *  - {{type: string, format: undefined|string}} jsonSchema the json schema definition of the type
     *                                                          (must be unique in order to provide inverse transformation)
     */
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