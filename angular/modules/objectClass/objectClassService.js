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
             * GET a single object class
             *
             * @param {string} name the name of the object class
             * @returns {{name: string, schema: {}}}
             */
            getObjectClass: function(name) {
                return $http
                    .get(BACKEND_BASE_URL + 'objectclasses/' + $filter('urlEncode')(name))
                    .then(function(response) {
                        return response.data;
                    });
            },

            /**
             * POST a new object class
             *
             * @param {{name: string, schema: {}}} objectClass the new object class
             * @returns {promise} resolved or rejected to the plain response
             */
            createObjectClass: function(objectClass) {
                return $http({
                    "method":   "POST",
                    "url":      BACKEND_BASE_URL + "objectclasses",
                    "data":     {
                        "objectClass": objectClass
                    }
                })
            },

            /**
             * PUT an update of an existing object class
             *
             * @param {{name: string, schema: {}}} objectClass the object class to update
             * @returns {promise} resolved or rejected to the plain response
             */
            updateObjectClass: function(objectClass) {
                return $http({
                    "method":   "PUT",
                    "url":      BACKEND_BASE_URL + "objectclasses/" + $filter('urlEncode')(objectClass.name),
                    "data":     {
                        "objectClass": objectClass
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