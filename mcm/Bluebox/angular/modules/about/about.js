'use strict';

/**
 * bluebox.about
 * module for the about page
 */
var aboutModule = angular.module('bluebox.about', [
        'ui.router'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("aboutState", {
            url:            "/about",
            templateUrl:    "angular/modules/about/about.html",
            controller:     "AboutController"
        });
    }]);