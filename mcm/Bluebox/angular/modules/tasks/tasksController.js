'use strict';

/**
 * TasksController
 * controller for the view of tasks
 */
tasksModule.controller('TasksController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http', 'fileSystemService', '$cookies',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http, fileSystemService, $cookies) {

            console.log("tasks!")

            updateValidTasks();

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
            $scope.updateValidTasks = updateValidTasks;
            function updateValidTasks() {
                $http.get('api_tasks/types')
                    .then(
                        function successCallback(response) {
                            //console.log(response.data);
                            $scope.validTasks = response.data;

                            if (!response.data) {
                                $rootScope.$broadcast('FlashMessage',{
                                            "type": "danger",
                                            "text": "unable to retrieve task list..."
                                        });
                            }
                        },
                        function errorCallback(response) {
                            console.log(JSON.stringify(response));
                            $rootScope.$broadcast('FlashMessage',{
                                        "type": "danger",
                                        "text": "Error: "
                                        + response.data
                                    });
                        });
            };


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


        }]);
