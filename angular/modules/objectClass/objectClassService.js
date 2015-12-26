'use strict';

/**
 * objectClassService
 * service for all backend requests concerning the object classes
 */
objectClassModule.factory(
    'objectClassService',
    ['$http', '$filter', 'BACKEND_BASE_URL', function($http, $filter, BACKEND_BASE_URL) {

        return {

            /**
             * GET the list of available object classes
             *
             * @returns {promise} resolved or rejected to the plain response
             */
            getObjectClasses: function() {
                return $http
                    .get(BACKEND_BASE_URL + 'objectclasses')
                    .then(function(response) {
                        return response.data.classes;
                    });
            },

            /**
             * POST a new object class
             *
             * @param objectClass the new object class
             * @returns {promise} resolved or rejected to the plain response
             */
            createObjectClass: function(objectClass) {
                return $http({
                    "method":   "POST",
                    "url":      BACKEND_BASE_URL + "objectclasses",
                    "data":     {
                        "objectClass": {
                            "name":   objectClass.name,
                            "schema": $filter('jsonSchema')(objectClass)
                        }
                    }
                })
            },

            /**
             * DELETE an object class
             *
             * @param objectClassName the name of the object class to delete
             * @returns {promise} resolved or rejected to the plain response
             */
            deleteObjectClass: function(objectClassName) {
                return $http.delete(BACKEND_BASE_URL + "objectclasses/" + $filter('urlEncode')(objectClassName));
            }
        };
    }]
);