'use strict';

/**
 * bluebox.fileSystem
 * module for the container overview page
 */
var fileSystemModule = angular.module('bluebox.fileSystem', [
        'ui.router',
        'bluebox.container',
        'bluebox.deleteConfirmation',
        'bluebox.filter',
        'bluebox.infiniteScroll',
        'bluebox.objectClass'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('fileSystemState', {
            url:            "/",
            templateUrl:    "angular/modules/fileSystem/fileSystem.html",
            controller:     "FileSystemController"
        });
    }]);