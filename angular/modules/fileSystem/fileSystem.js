'use strict';

var fileSystemModule = angular.module('bluebox.fileSystem', [
    'infiniteScroll',
    'ui.router',
    'bluebox.container',
    'bluebox.messageBag'
])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('fileSystemState', {
            url:            "/",
            templateUrl:    "angular/modules/fileSystem/fileSystem.html",
            controller:     "FileSystemController"
        });
    }]);