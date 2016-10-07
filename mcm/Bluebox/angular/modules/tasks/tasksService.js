'use strict';

/**
 * tasksService
 * service for all backend requests
 */
tasksModule.factory(
    'tasksService',
    ['$http', '$filter', 'BACKEND_BASE_URL_TASKS_API',
        function($http, $filter, BACKEND_BASE_URL_TASKS_API) {

            return {

                /**
                 * POST a new message
                 *
                 */
                postMessage: function(message) {
                    return $http({
                        "method":   "POST",
                        "url":      BACKEND_BASE_URL_TASKS_API + "send_message",
                        "data":     message
                    })
                },
                /**
                 * retrieve messages
                 *
                 */
                retrieveMessages: function(credentials) {
                    return $http({
                        "method":   "POST",
                        "url":      BACKEND_BASE_URL_TASKS_API + "receive_messages",
                        "data":     credentials
                    })
                },


                getValidTasks: function () {
                    return $http({
                        "method":   "GET",
                        "url":      BACKEND_BASE_URL_TASKS_API + "types"
                    })

                }
            };
        }]);


