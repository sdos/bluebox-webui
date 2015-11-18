'use strict';

var containerModule = angular.module('bluebox.container', [
    'infiniteScroll',
    'ui.router',
    'ngFileUpload',
    'bluebox.fileSystem',
    'bluebox.messageBag'
])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("containerState", {
            url:            "/container/:containerName",
            templateUrl:    "angular/modules/container/container.html",
            controller:     "ContainerController"
        });
    }]);