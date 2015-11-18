'use strict';

fileSystemModule.factory(
    'fileSystemService',
    ['$http', '$httpParamSerializer', '$q', function($http, $httpParamSerializer, $q) {
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