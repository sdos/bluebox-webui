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
            $scope.validTasks = {"no": "...not loaded..."};
            $scope.availableContainers = undefined;

            $scope.newTaskDefinition = {
                "type": "",
                "container": "",
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
                    //console.log($scope.availableContainers);
                });




            /**
             *
             * send a new message
             *
             * */

            $scope.sendMessage = function () {
                tasksService.postMessage($scope.newTaskDefinition)
                    .then(function (response) {
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "success",
                            "text": "message sent"
                        });
                        //console.log($scope.availableContainers);
                    })
            };

            /**
             *
             * receive the messages
             *
             * */

            $scope.receive_from_beginning = function () {
                tasksService.retrieveMessages($scope.credentials, true)
                    .then(function (response) {
                        $scope.myMessages = $scope.myMessages.concat(response.data);
                    })
            };

            var receive = function () {
                tasksService.retrieveMessages($scope.credentials, false)
                    .then(function (response) {
                        if (response.data) {
                            $scope.myMessages = $scope.myMessages.concat(response.data);
                            //console.log(response.data);
                            $interval(function () {
                                receive();
                            }, 2000, 1);
                        }
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
                        return "flight_takeoff";
                    } else if (msg.type.startsWith("response")) {
                        return "flight_landing";
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


        }]);
