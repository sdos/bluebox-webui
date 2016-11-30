'use strict';

/**
 * TasksController
 * controller for the view of tasks
 */
tasksModule.controller('TasksController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http', 'fileSystemService', 'tasksService', '$cookies', '$interval',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http, fileSystemService, tasksService, $cookies, $interval) {

            console.log("tasks!");


            $scope.myMessages = [];
            $scope.myKeys = [];
            $scope.validTasks = {"no": "...not loaded..."};
            $scope.availableContainers = undefined;

            $scope.newTaskDefinition = {
                "type": $stateParams.task,
                "container": $stateParams.container,
                "tenant": $cookies.get('MCM-TENANT'),
                "token": $cookies.get('XSRF-TOKEN')
            };
            $scope.credentials = {
                "tenant": $cookies.get('MCM-TENANT'),
                "token": $cookies.get('XSRF-TOKEN')
            };

            /**
             *
             * Get the list of valid tasks
             *
             * */
            tasksService.getValidTasks()
                .then(function (response) {
                    $scope.validTasks = response.data;
                });


            /**
             *
             * Get the list of container from swift
             *
             * */

            fileSystemService.getContainers("", "", 10000)
                .then(function (response) {
                    $scope.availableContainers = response.containers;
                });


            /**
             *
             * send a new message
             *
             * */

            $scope.sendMessage = function () {
                $rootScope.$broadcast('FlashMessage', {
                    "type": "wait",
                    "text": "sending message..."
                });
                tasksService.postMessage($scope.newTaskDefinition)
                    .then(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "message sent successfully"
                        });
                        //console.log($scope.availableContainers);
                    })
            };
            /**
             helper function to add response data to messages
             */
            var addMsgs = function (resp) {
                var idx = $scope.myKeys.indexOf(resp.correlation);
                if (idx == -1) {
                    $scope.myKeys.unshift(resp.correlation);
                    $scope.myMessages.unshift([resp]);
                }
                else {
                    $scope.myMessages[idx].push(resp);
                }
            };
            /**
             *
             * receive the messages
             *
             * */
            $scope.receive_from_beginning = function () {
                $scope.loading_stopped = false;
                tasksService.retrieveMessages($scope.credentials, true)
                    .then(function (response) {
                        $scope.loading_stopped = true;
                        $scope.clear_all_messages();
                        for (var i = 0; i < response.data.length; i++) {
                            addMsgs(response.data[i]);
                        }
                    }, function (e) {
                        $scope.loading_stopped = true;
                    })
            };

            var receive = function () {
                $scope.loading_stopped = false;
                tasksService.retrieveMessages($scope.credentials, false)
                    .then(function (response) {
                        if (response.data) {
                            $scope.loading_stopped = true;
                            for (var i = 0; i < response.data.length; i++) {
                                addMsgs(response.data[i]);
                            }
                            if (!$scope["$$destroyed"]) {
                                $interval(function () {
                                    receive();
                                }, 2000, 1);
                            }

                        }
                    }, function (e) {
                        $scope.loading_stopped = true;
                    })
            };
            receive();


            /**
             *
             * clear the existing messages
             *
             * */
            $scope.clear_all_messages = function () {
                $scope.myMessages = [];
                $scope.myKeys = [];
            };


            /**
             *
             * helper for html styling
             * */
            $scope.ui_color_for_msg = function (msg) {

                try {
                    return '#' + msg.correlation.substring(0, 6);
                }
                catch (err) {
                    return "black";
                }

            };

            /**
             *
             * helper for html styling
             * */
            $scope.ui_icon_for_msg = function (msg) {
                try {
                    if (msg.type in $scope.validTasks) {
                        return "call_made";
                    } else if (msg.type.startsWith("error")) {
                        return "error";
                    } else if (msg.type.startsWith("processing")) {
                        return "settings";
                    } else if (msg.type.startsWith("pong")) {
                        return "call_missed_outgoing";
                    } else if (msg.type.startsWith("response")) {
                        return "call_received";
                    } else if (msg.type.startsWith("success")) {
                        return "done";
                    } else {
                        return "code";
                    }
                }
                catch (err) {
                    return "code";
                }

            };

            $scope.txt_for_msg = function (msg) {
                try {
                    if (msg.type in $scope.validTasks) {
                        return "tenant:" + msg.tenant + " > worker:" + msg.worker;
                    } else if (msg.type.startsWith("processing") || msg.type.startsWith("pong")) {
                        return "worker:" + msg.worker;
                    } else if (msg.type.startsWith("success")) {
                        return msg.message.substring(msg.message.lastIndexOf("finished:") + "finished:".length) || msg.substring(msg.lastIndexOf("finished:") + "finished:".length);
                    } else {
                        return msg;
                    }
                }
                catch (err) {
                    return msg;
                }

            };


        }]);
