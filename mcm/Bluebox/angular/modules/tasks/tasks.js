'use strict';

/**
 * bluebox.container
 * module for the container contents page
 */
var tasksModule = angular.module('bluebox.tasks', [
    'ui.router',
    'angular-websocket'
])

    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state("tasksState", {
            url: "/tasks",
            params: {container: null, task: null},
            templateUrl: "angular/modules/tasks/tasks.html",
            controller: "TasksController"
        });
    }]);