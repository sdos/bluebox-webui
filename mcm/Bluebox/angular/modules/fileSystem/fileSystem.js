'use strict';

/**
 * bluebox.fileSystem
 * module for the container overview page
 */
var fileSystemModule = angular.module('bluebox.fileSystem', [
        'ui.router',
        'bluebox.container',
        'bluebox.filter',
        'bluebox.objectClass',
        'md.data.table'
    ])

    .config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {
        $stateProvider.state('fileSystemState', {
            url:            "/",
            templateUrl:    "angular/modules/fileSystem/fileSystem.html",
            controller:     "FileSystemController"
        });
    }]);