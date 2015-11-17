'use strict';

var containerModule = angular.module('bluebox.container', [
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