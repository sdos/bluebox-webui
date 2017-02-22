'use strict';

/**
 * TasksController
 * controller for the view of tasks
 */
tasksModule.controller('TasksController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http', 'fileSystemService', '$cookies', '$interval', '$websocket', 'WEBSOCKET_TASKS_PORT', 'MY_PUBLIC_HOSTNAME',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http, fileSystemService, $cookies, $interval, $websocket, WEBSOCKET_TASKS_PORT, MY_PUBLIC_HOSTNAME) {

            console.log("tasks!");

            $scope.loading_stopped = true;
            $scope.myMessages = [];
            $scope.myKeys = [];
            $scope.validTasks = {
                "identify_content": "Identify content types",
                "extract_metadata": "Extract metadata",
                "replicate_metadata": "Replicate metadata",
                "dispose": "Dispose of old objects",
                "ping": "ping"
            };
            $scope.availableContainers = undefined;

            var my_topic = $cookies.get('MCM-TENANT-NAME');

            $scope.newTaskDefinition = {
                "type": $stateParams.task,
                "container": $stateParams.container,
                "token": $cookies.get('XSRF-TOKEN'),
                "tenant-id": $cookies.get('MCM-TENANT-ID'),
                "correlation": undefined,
                "worker": "bluebox-" + $cookies.get('MCM-SESSION-ID')
            };

            var ws_url = 'ws://' + MY_PUBLIC_HOSTNAME + ":" + WEBSOCKET_TASKS_PORT + '/v2/broker/?topics=' + my_topic;
            var ws = $websocket(ws_url);


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
                var task = $scope.newTaskDefinition;
                task.correlation = generateUUID();
                var msg = {
                    topic: my_topic,
                    message: JSON.stringify(task)
                };

                $rootScope.$broadcast('FlashMessage', {
                    "type": "wait",
                    "text": "sending message..."
                });
                ws.send(JSON.stringify(msg));

            };

            /**
             retrieve messages
             */
            ws.onClose(function () {
                $scope.loading_stopped = true;
                console.log("websocket closed; reopening...");
                ws = $websocket(ws_url);
            });

            ws.onError(function () {
                $scope.loading_stopped = true;
                console.log("websocket error!");
            });

            ws.onOpen(function () {
                $scope.loading_stopped = false;
                console.log("websocket connected!");
            });


            ws.onMessage(function (message) {
                var d = JSON.parse(message.data);
                var m = JSON.parse(d.message);
                //console.log(d);
                //console.log(m);
                addMsgs(m);
            });


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
                        return "send";
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
                        return "tenant:" + msg["tenant-id"] + " > worker:" + msg.worker;
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


            function generateUUID() {
                var d = new Date().getTime();
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
                return uuid;
            };

        }]);
