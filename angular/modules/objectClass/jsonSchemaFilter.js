"use strict";

/**
 * jsonSchema filter
 * filter that converts an object class input into a JSON schema
 */
objectClassModule.filter(
    'jsonSchema',
    function() {

        return function(objectClass) {
            var schema = {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "description": objectClass.name,
                "type": "object",
                "required": [],
                "properties": {}
            };

            for (var i in objectClass.metadataFields) {
                var metadataField = angular.copy(objectClass.metadataFields[i]);
                if (angular.isDefined(name) && metadataField.name !== "" && angular.isDefined(metadataField.type.jsonSchema)) {
                    schema.properties[metadataField.name] = metadataField.type.jsonSchema;
                    if (metadataField.default) {
                        schema.properties[metadataField.name].default = metadataField.default;
                    }
                    if (metadataField.required) {
                        schema.required.push(metadataField.name);
                    }
                }
            }

            return schema;
        };
    }
);