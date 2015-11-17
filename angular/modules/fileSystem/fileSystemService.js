'use strict';

fileSystemModule.factory(
    'fileSystemService',
    ['$http', '$httpParamSerializer', '$q', function($http, $httpParamSerializer, $q) {
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

            getContainers: function() {
                var deferred = $q.defer();
                $http.get('/swift/containers')
                    .then(function successCallback(response) {
                            deferred.resolve(response.data);
                        }, function errorCallback(response) {
                            deferred.reject(response);
                        }
                    );

                return deferred.promise;
            }
        };
    }]);