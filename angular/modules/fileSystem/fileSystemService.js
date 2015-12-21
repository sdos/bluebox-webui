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
             * the limit of containers to retrieve at once
             * @type {number}
             */
            var limit = 20;

            /**
             * name of the last retrieved container
             * @type {string}
             */
            var currentMarker = "";

            /**
             * true, if there are no more containers to retrieve from the backend
             * @type {boolean}
             */
            var isEndOfListReached = false;

            return {

                /**
                 * POST a new container
                 *
                 * @param {{name: string, objectClass: string}} container the new container
                 * @returns {promise} resolved or rejected to the plain response from the backend
                 */
                createContainer: function(container) {
                    return $http({
                        "method":           "POST",
                        "url":              BACKEND_BASE_URL + "containers",
                        "data":             {
                            "container": {
                                "name":         container.name,
                                "objectClass":  container.objectClass.name
                            }
                        }
                    })
                },

                /**
                 * GET the next partial list of containers
                 *
                 * @param {boolean} reload if true, the marker will be reset and the whole list will be reloaded
                 * @param {string}  prefix filter containers for a certain prefix (optional)
                 * @returns {promise} resolved to the response data,
                 *                    rejected to the plain response if unsuccessful
                 */
                getContainers: function(reload, prefix) {
                    // reset marker if list shall be reloaded
                    currentMarker = reload ? "" : currentMarker;

                    return $http({
                        "method": "GET",
                        "url":    BACKEND_BASE_URL + "containers",
                        "params": {
                            "limit":  limit,
                            "marker": currentMarker,
                            "prefix": prefix ? prefix : ""
                        }
                    }).then(function(response) {
                        var containers = response.data.containers;
                        currentMarker = containers.length > 0 ? _.last(containers).name : currentMarker;
                        isEndOfListReached = containers.length < limit;
                        return response.data;
                    });
                },

                /**
                 * true, if there are no more containers to retrieve from the backend
                 *
                 * @returns {boolean}
                 */
                isEndOfListReached: function() {
                    return isEndOfListReached;
                },

                /**
                 * DELETE a container
                 *
                 * @param {string} container the container to delete
                 * @returns {promise} resolved or rejected to the plain response
                 */
                deleteContainer: function(container) {
                    return $http.delete(BACKEND_BASE_URL + 'containers/' + $filter('urlEncode')(container.name));
                }
            };
        }]);