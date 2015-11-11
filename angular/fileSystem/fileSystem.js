'use strict';

var fileSystemModule = angular.module('bluebox.fileSystem', [
    'ui.router'
])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('fileSystemState', {
            url:            "/",
            templateUrl:    "angular/fileSystem/fileSystem.html",
            controller:     "FileSystemController"
        });
    }]);