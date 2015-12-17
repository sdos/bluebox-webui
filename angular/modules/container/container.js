'use strict';

/**
 * bluebox.container
 * module for the container contents page
 */
var containerModule = angular.module('bluebox.container', [
    'ngFileUpload',
    'ui.bootstrap',
    'ui.router',
    'bluebox.deleteConfirmation',
    'bluebox.dateInput',
    'bluebox.fileSystem',
    'bluebox.infiniteScroll'
])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("containerState", {
            url:            "/container/:containerName",
            templateUrl:    "angular/modules/container/container.html",
            controller:     "ContainerController"
        });
    }]);