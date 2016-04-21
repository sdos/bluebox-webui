'use strict';

/**
 * bluebox.dataTable
 * module for the about page
 */
var schemaViewerModule = angular.module('bluebox.schemaViewer', [
        'ui.router'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("schemaViewerState", {
            url:            "/schema",
            templateUrl:    "angular/modules/schemaViewer/schemaViewer.html",
            controller:     "schemaViewerController"
        });
    }]);