'use strict';

/**
 * bluebox.container
 * module for the container contents page
 */
var tasksModule = angular.module('bluebox.tasks', [
        'ui.bootstrap',
        'ui.router',
        'smart-table'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("tasksState", {
            url:            "/tasks",
            templateUrl:    "angular/modules/tasks/tasks.html",
            controller:     "TasksController"
        });
    }]);