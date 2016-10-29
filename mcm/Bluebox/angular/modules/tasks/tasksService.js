'use strict';

/**
 * tasksService
 * service for all backend requests
 */
tasksModule.factory(
    'tasksService',
    ['$http', '$filter', 'BACKEND_BASE_URL_TASKS_API', 'CLIENT_ID',
        function($http, $filter, BACKEND_BASE_URL_TASKS_API, CLIENT_ID) {

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
                retrieveMessages: function(credentials, from_beginning) {
                     credentials["client_id"] = CLIENT_ID;
                    return $http({
                        "method":   "POST",
                        "url":      BACKEND_BASE_URL_TASKS_API + (from_beginning ? "receive_all_messages" : "receive_messages"),
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


