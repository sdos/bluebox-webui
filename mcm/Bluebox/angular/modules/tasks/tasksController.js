'use strict';

/**
 * TasksController
 * controller for the view of tasks
 */
tasksModule.controller('TasksController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http', 'fileSystemService', 'tasksService', '$cookies',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http, fileSystemService, tasksService, $cookies) {

            console.log("tasks!")


            $scope.validTasks = {"no": "...not loaded..."};
            $scope.availableContainers = undefined;

            $scope.newTaskDefinition = {
                "type": "",
                "container": "",
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
                        if (!response.data) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": "unable to retrieve task list..."
                            });
                        }
                    },
                    function errorCallback(response) {
                        console.log(JSON.stringify(response));
                        $rootScope.$broadcast('FlashMessage', {
                            "type": "danger",
                            "text": "Error: "
                            + response.data
                        });
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
                })
                .catch(function (response) {
                    if (401 == response.status) {
                        $state.go('loginState', {noAuth: true});
                        return;
                    }
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "warning",
                        "text": response.data
                    });
                });



            /**
             *
             * send a new message
             *
             * */

            $scope.sendMessage = function() {
                tasksService.postMessage($scope.newTaskDefinition)
                .then(function (response) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "success",
                        "text": "message sent"
                    });
                    //console.log($scope.availableContainers);
                })
                .catch(function (response) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "warning",
                        "text": response.data
                    });
                })
            };







        }]);
