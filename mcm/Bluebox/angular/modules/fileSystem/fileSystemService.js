'use strict';

/**
 * fileSystemService
 * service for all backend requests concerning the container overview
 */
fileSystemModule.factory(
    'fileSystemService',
    ['$http', '$filter', 'BACKEND_BASE_URL',
        function($http, $filter, BACKEND_BASE_URL) {

            /**
             * constructs the proper request data object from a container, omits all unnecessary properties
             *
             * @param {object} container the received container
             * @returns {{container: {name: string, objectClass: string}}}
             */
            var getCleanRequestData = function(container) {
                return {
                    "container": {
                        "name":         container.name,
                        "objectClass":  container.objectClass,
                        "mdf":  container.mdf,
                        "mdfi":  container.mdfi,
                        "sdos": container.sdos,
                        "sdosPartitionBits": container.sdosPartitionBits,
                        "sdosHeight": container.sdosHeight
                    }
                };
            };

            return {

                /**
                 * POST a new container
                 *
                 * @param {{name: string, objectClass: string}} container the new container
                 * @returns {promise} resolved or rejected to the plain response from the backend
                 */
                createContainer: function(container) {
                    return $http({
                        "method":   "POST",
                        "url":      BACKEND_BASE_URL + "containers",
                        "data":     getCleanRequestData(container)
                    })
                },

                /**
                 * PUT an update of a container
                 *
                 * @param {{name: string, objectClass: string}} container the container to update
                 * @returns {promise} resolved or rejected to the plain response from the backend
                 */
                updateContainer: function(container) {
                	//console.log(container);
                    return $http({
                        "method":   "PUT",
                        "url":      BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(container.name),
                        "data":     getCleanRequestData(container)
                    })
                },

                /**
                 * GET the next partial list of containers
                 *
                 * @param {boolean} reload if true, the marker will be reset and the whole list will be reloaded
                 * @param {string}  prefix filter containers for a certain prefix (optional)
                 * @returns {promise} resolved to the response data,
                 *                    rejected to the plain response if uns$scope.fileSystem.containersuccessful
                 */
                getContainers: function(prefix, marker, limit) {

                    return $http({
                        "method": "GET",
                        "url":    BACKEND_BASE_URL + "containers",
                        "params": {
                            "limit":  limit,
                            "marker": marker,
                            "prefix": prefix ? prefix : ""
                        }
                    }).then(function(response) {
                        return response.data;
                    });
                },

                /**
                 * DELETE a container
                 *
                 * @param {string} container the container to delete
                 * @returns {promise} resolved or rejected to the plain response
                 */
                deleteContainer: function(container) {
                    return $http.delete(BACKEND_BASE_URL + 'containers/' + $filter('urlEncode')(container.name));
                },
                
                
                
                /**
                 * GET the details of a container
                 *
                 */
                getContainerMetadata: function(container) {
                	return $http
                	.get(BACKEND_BASE_URL + "containers/" + $filter('urlEncode')(container.name) + "/details")
                	.then(function(response) {
                		return response.data;
                	});
                },
            };
        }]);