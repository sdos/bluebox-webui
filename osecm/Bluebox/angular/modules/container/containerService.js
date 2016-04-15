'use strict';

/**
 * containerService
 * service for all backend requests concerning the objects inside containers
 */
containerModule.factory(
    'containerService',
    ['$http', '$filter', 'Upload', 'BACKEND_BASE_URL', function($http, $filter, Upload, BACKEND_BASE_URL) {

        /**
         * true, if there are no more objects to retrieve from the backend
         * @type {boolean}
         */
        var isEndOfListReached = false;

        /**
         * the limit of objs to retrieve at once
         * @type {number}
         */
        var limit = 20;
        
        
        return {

            /**
             * GET the next partial list of objects
             *
             * @param {string}  container   the container
             * @param {boolean} reload      if true, the marker will be reset and the whole list will be reloaded
             * @param {string}  prefix      filter objects for a certain prefix (optional)
             * @returns {promise} resolved to the data of the response,
             *                    rejected to the plain response if unsuccessful
             */
            getObjects: function(container, prefix, marker) {

                return $http({
                    "method": "GET",
                    "url":    BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(container.name) + "/objects",
                    "params": {
                        "limit":  limit,
                        "marker": marker,
                        "prefix": prefix ? prefix : ""
                    }
                }).then(function(response) {
                    var objects = response.data.objects;
                    return response.data;
                });
            },


            /**
             * DELETE an object from a container
             *
             * @param {string} container the container the object is in
             * @param {string} object    the object to delete
             * @returns {promise} resolved or rejected to the plain response
             */
            deleteObject: function(container, object) {
                return $http.delete(
                    BACKEND_BASE_URL + 'containers/' + $filter('urlEncode')(container.name) + '/objects/' + $filter('urlEncode')(object.name)
                );
            },

            /**
             * upload a file to a container
             *
             * @param {object}            file          the file to upload
             * @param {string}            containerName name of the container
             * @param {{key: value, ...}} metadata      the provided metadata for the object
             * @param {date}              retentionDate date after that the file shall be automatically deleted from the server (optional)
             * @returns {promise} resolved or rejected to the plain response
             */
            uploadObject: function(file, containerName, metadata, retentionDate) {
                // filter all dates to the proper format
                for (var i in metadata) {
                    metadata[i] = angular.isDate(metadata[i]) ? $filter('date')(metadata[i], "yyyy-MM-dd") : metadata[i];
                }

                return Upload.upload({
                    "method": "POST",
                    "url": BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(containerName) + "/objects",
                    "data": {
                        "objectName":       file,
                        "metadata":         Upload.json(metadata),
                        "RetentionPeriod":  retentionDate ? $filter('date')(retentionDate, "yyyy-MM-dd") : ""
                    }
                });
            },

            /**
             * GET the details of an object
             *
             * @param {string} container the container the object is in
             * @param {string} object    the object
             * @returns {promise} resolved to the response data if successful, else rejected to the plain response
             */
            getDetails: function(container, object) {
                return $http
                    .get(BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(container.name) + "/objects/" + $filter('urlEncode')(object.name) + "/details")
                    .then(function(response) {
                        return response.data;
                    });
            }
        };
    }]);