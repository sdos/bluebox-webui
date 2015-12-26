"use strict";

/**
 * jsonSchema filter
 * filter that converts an object class input into a JSON schema or vice versa
 *
 * additional parameters:
 *  - {boolean} inverseMode if true, a JSON schema is expected and will be deserialized
 */
objectClassModule.filter(
    'jsonSchema',
    ['METADATA_FIELD_TEMPLATE', 'TYPE_OPTIONS',
        function(METADATA_FIELD_TEMPLATE, TYPE_OPTIONS) {

            /**
             * converts an object class input into a JSON schema
             *
             * @param {{name: string, metadataFields: Array}} objectClass
             * @returns {{$schema: string, description: string, type: string, required: Array, properties: {}}}
             */
            var getJsonSchema = function(objectClass) {
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

            /**
             * converts a JSON schema into an object class input
             *
             * @param {{$schema: string, description: string, type: string, required: Array, properties: {}}} schema
             * @returns {{name: string, metadataFields: Array}}
             */
            var getObjectClass = function(schema) {
                var objectClass = {
                    name:           schema.description,
                    metadataFields: []
                };
                for (var property in schema.properties) {
                    var metadataField = angular.copy(METADATA_FIELD_TEMPLATE);
                    var propertyDefinition = schema.properties[property];
                    metadataField.name = property;
                    metadataField.type = _.find(TYPE_OPTIONS, function (option) {
                            return _.isEqual(option.jsonSchema, _.omit(propertyDefinition, "default"));
                        }
                    );
                    metadataField.default = propertyDefinition.default || "";
                    metadataField.required = _.contains(schema.required, property);
                    objectClass.metadataFields.push(metadataField);
                }

                return objectClass;
            };

            return function(input, inverseMode) {
                return inverseMode ? getObjectClass(input) : getJsonSchema(input);
            };
        }]
);