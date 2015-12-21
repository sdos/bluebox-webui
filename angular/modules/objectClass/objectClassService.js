'use strict';

/**
 * objectClassService
 * service for all backend requests concerning the object classes
 */
objectClassModule.factory(
    'objectClassService',
    ['$http', '$filter', 'BACKEND_BASE_URL', function($http, $filter, BACKEND_BASE_URL) {

        return {

            getObjectClasses: function() {
                return $http.get(BACKEND_BASE_URL + 'objectclasses');
            },

            createObjectClass: function(objectClass) {
                return $http({
                    "method":   "POST",
                    "url":      BACKEND_BASE_URL + "objectclasses",
                    "data":     {
                        objectClass: {
                            name:   objectClass.name,
                            schema: $filter('jsonSchema')(objectClass)
                        }
                    }
                })
            }
        };
    }]
);