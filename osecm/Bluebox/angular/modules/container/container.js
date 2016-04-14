'use strict';

/**
 * bluebox.container
 * module for the container contents page
 */
var containerModule = angular.module('bluebox.container', [
        'ngFileUpload',
        'ui.router',
        'elif',
        'bluebox.deleteConfirmation',
        'bluebox.filter',
        'bluebox.fileSystem',
        'bluebox.infiniteScroll',
        'bluebox.objectClass',
        'data-table'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("containerState", {
            url:            "/container/:containerName",
            templateUrl:    "angular/modules/container/container.html",
            controller:     "ContainerController"
        });
    }]);