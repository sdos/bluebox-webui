'use strict';

/**
 * tasksService
 * service for all backend requests
 */
tasksModule.factory(
    'tasksService',
    ['$http', '$filter', 'BACKEND_BASE_URL_TASKS_API',
        function ($http, $filter, BACKEND_BASE_URL_TASKS_API) {

            return {

                /**
                 * POST a new message
                 *
                 */
                postMessage: function (message) {
                    return $http({
                        "method": "POST",
                        "url": BACKEND_BASE_URL_TASKS_API + "send_message",
                        "data": message
                    })
                },
                /**
                 * retrieve messages
                 *
                 */
                retrieveMessages: function (from_beginning) {
                    return $http({
                        "method": "POST",
                        "url": BACKEND_BASE_URL_TASKS_API + (from_beginning ? "receive_all_messages" : "receive_messages")
                    })
                },


                getValidTasks: function () {
                    return $http({
                        "method": "GET",
                        "url": BACKEND_BASE_URL_TASKS_API + "types"
                    })

                }
            };
        }]);


