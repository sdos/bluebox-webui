'use strict';

var containerModule = angular.module('bluebox.container', [
    'ui.router',
    'ngFileUpload'
])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("containerState", {
            url:            "/container/:containerName",
            templateUrl:    "angular/container/container.html",
            controller:     "ContainerController"
        });
    }]);