'use strict';

/**
 * containerService
 * service for all backend requests concerning the objects inside containers
 */
containerModule.factory(
    'containerService',
    ['$http', '$q', '$filter', 'Upload', function($http, $q, $filter, Upload) {

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

        return {

            /**
             * GET the next partial list of objects
             *
             * @param {string}  containerName name of the container
             * @param {boolean} reload        if true, the marker will be reset and the whole list will be reloaded
             * @param {string}  prefix        filter objects for a certain prefix (optional)
             * @returns {promise} resolved to the retrieved objects,
             *                    rejected to the plain response if unsuccessful
             */
            getObjects: function(containerName, reload, prefix) {
                var deferred = $q.defer();

                // reset marker if list shall be reloaded
                currentMarker = reload ? "" : currentMarker;

                $http({
                    "method": "GET",
                    "url":    "/swift/containers/" + containerName + "/objects",
                    "params": {
                        "limit":  limit,
                        "marker": currentMarker,
                        "prefix": prefix ? prefix : ""
                    }
                }).then(function successCallback(response) {
                        var objects = response.data;
                        currentMarker = objects.length > 0 ? _.last(objects).name : currentMarker;
                        deferred.resolve(objects);
                    }, function errorCallback(response) {
                        deferred.reject(response);
                    }
                );

                return deferred.promise;
            },

            /**
             * DELETE an object from a container
             *
             * @param {string} containerName name of the container
             * @param {string} objectName    name of the object to delete
             * @returns {promise} resolved to the data of the response,
             *                    rejected to the plain response if unsuccessful
             */
            deleteObject: function(containerName, objectName) {
                var deferred = $q.defer();
                $http.delete('/swift/containers/' + containerName + '/objects/' + $filter('urlEncode')(objectName))
                    .then(function successCallback(response) {
                            deferred.resolve(response.data);
                        }, function errorCallback(response) {
                            deferred.reject(response);
                        }
                    );

                return deferred.promise;
            },

            /**
             * upload a file to a container
             *
             * @param {object} file          the file to upload
             * @param {string} containerName name of the container
             * @param {string} ownerName     name of the owner of the file (optional)
             * @param {date}   retentionDate date after that the file shall be automatically deleted from the server (optional)
             * @returns {*|r.promise|promise}
             */
            uploadObject: function(file, containerName, ownerName, retentionDate) {
                var deferred = $q.defer();
                Upload.upload({
                    "method": "POST",
                    "url": "/swift/containers/" + containerName + "/objects",
                    "data": {
                        "objectName":       file,
                        "OwnerName":        ownerName ? ownerName : "",
                        "RetentionPeriod":  retentionDate ? retentionDate : ""
                    }
                }).then(function successCallback(response) {
                        deferred.resolve(response.data);
                    }, function errorCallback(response) {
                        deferred.reject(response);
                    }
                );

                return deferred.promise;
            }
        };
    }]);