'use strict';

/**
 * fileSystemService
 * service for all backend requests concerning the container overview
 */
fileSystemModule.factory(
    'fileSystemService',
    ['$http', '$httpParamSerializer', '$q', function($http, $httpParamSerializer, $q) {

        /**
         * the limit of containers to retrieve at once
         * @type {number}
         */
        var limit = 20;

        /**
         * name of the last retrieved container
         * @type {string}
         */
        var currentMarker = "";

        return {

            /**
             * POST a new container
             *
             * @param containerName
             * @returns {promise} resolved or rejected to the plain response from the backend
             */
            createContainer: function(containerName) {
                var deferred = $q.defer();
                $http({
                    "method":           "POST",
                    "url":              "/swift/containers",
                    "data":             {"containerName": containerName},
                    "headers":          {"Content-Type": "application/x-www-form-urlencoded"},
                    "transformRequest": $httpParamSerializer
                }).then(function successCallback(response) {
                        deferred.resolve(response);
                    }, function errorCallback(response) {
                        deferred.reject(response);
                    }
                );

                return deferred.promise;
            },

            /**
             * GET the next partial list of containers
             *
             * @param {boolean} reload if true, the marker will be reset and the whole list will be reloaded
             * @param {string}  prefix filter containers for a certain prefix (optional)
             * @returns {promise} resolved to the retrieved containers,
             *                    rejected to the plain response if unsuccessful
             */
            getContainers: function(reload, prefix) {
                var deferred = $q.defer();

                // reset marker if list shall be reloaded
                currentMarker = reload ? "" : currentMarker;

                $http({
                    "method": "GET",
                    "url":    "/swift/containers",
                    "params": {
                        "limit":  limit,
                        "marker": currentMarker,
                        "prefix": prefix ? prefix : ""
                    }
                }).then(function successCallback(response) {
                        var containers = response.data;
                        currentMarker = containers.length > 0 ? _.last(containers).name : currentMarker;
                        deferred.resolve(containers);
                    }, function errorCallback(response) {
                        deferred.reject(response);
                    }
                );

                return deferred.promise;
            }
        };
    }]);