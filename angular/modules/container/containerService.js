'use strict';

/**
 * containerService
 * service for all backend requests concerning the objects inside containers
 */
containerModule.factory(
    'containerService',
    ['$http', '$filter', 'Upload', 'BACKEND_BASE_URL', function($http, $filter, Upload, BACKEND_BASE_URL) {

        /**
         * the limit of objects to retrieve at once
         * @type {number}
         */
        var limit = 20;

        /**
         * name of the last retrieved object
         * @type {string}
         */
        var currentMarker = "";

        /**
         * true, if there are no more objects to retrieve from the backend
         * @type {boolean}
         */
        var isEndOfListReached = false;

        return {

            /**
             * GET the next partial list of objects
             *
             * @param {string}  containerName name of the container
             * @param {boolean} reload        if true, the marker will be reset and the whole list will be reloaded
             * @param {string}  prefix        filter objects for a certain prefix (optional)
             * @returns {promise} resolved to the data of the response,
             *                    rejected to the plain response if unsuccessful
             */
            getObjects: function(containerName, reload, prefix) {
                // reset marker if list shall be reloaded
                currentMarker = reload ? "" : currentMarker;

                return $http({
                    "method": "GET",
                    "url":    BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(containerName) + "/objects",
                    "params": {
                        "limit":  limit,
                        "marker": currentMarker,
                        "prefix": prefix ? prefix : ""
                    }
                }).then(function(response) {
                    var objects = response.data.objects;
                    currentMarker = objects.length > 0 ? _.last(objects).name : currentMarker;
                    isEndOfListReached = objects.length < limit;
                    return response.data;
                });
            },

            /**
             * true, if there are no more objects to retrieve from the backend
             *
             * @returns {boolean}
             */
            isEndOfListReached: function() {
                return isEndOfListReached;
            },

            /**
             * DELETE an object from a container
             *
             * @param {string} containerName name of the container
             * @param {string} objectName    name of the object to delete
             * @returns {promise} resolved or rejected to the plain response
             */
            deleteObject: function(containerName, objectName) {
                return $http.delete(
                    BACKEND_BASE_URL + 'containers/' + $filter('urlEncode')(containerName) + '/objects/' + $filter('urlEncode')(objectName)
                );
            },

            /**
             * upload a file to a container
             *
             * @param {object} file          the file to upload
             * @param {string} containerName name of the container
             * @param {string} ownerName     name of the owner of the file (optional)
             * @param {date}   retentionDate date after that the file shall be automatically deleted from the server (optional)
             * @returns {promise} resolved or rejected to the plain response
             */
            uploadObject: function(file, containerName, ownerName, retentionDate) {
                return Upload.upload({
                    "method": "POST",
                    "url": BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(containerName) + "/objects",
                    "data": {
                        "objectName":       file,
                        "OwnerName":        ownerName ? ownerName : "",
                        "RetentionPeriod":  retentionDate ? $filter('date')(retentionDate, "yyyy-MM-dd") : ""
                    }
                });
            },

            /**
             * GET the details of an object
             *
             * @param {string} containerName name of the container
             * @param {string} objectName    name of the object
             * @returns {promise} resolved or rejected to the plain response
             */
            getDetails: function(containerName, objectName) {
                return $http.get(BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(containerName) + "/objects/" + $filter('urlEncode')(objectName) + "/details")
                    .then(function(response) {
                        return response.data;
                    });
            }
        };
    }]);