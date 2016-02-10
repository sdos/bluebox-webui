'use strict';

/**
 * bluebox.container
 * module for the container contents page
 */
var tasksModule = angular.module('bluebox.tasks', [
        'ngFileUpload',
        'ui.bootstrap',
        'ui.router',
        'elif'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("tasksState", {
            url:            "/tasks",
            templateUrl:    "angular/modules/tasks/tasks.html",
            controller:     "TasksController"
        });
    }]);