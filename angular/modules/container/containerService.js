'use strict';

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