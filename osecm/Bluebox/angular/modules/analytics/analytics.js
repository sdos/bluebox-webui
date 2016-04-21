'use strict';

/**
 * bluebox.analytics
 * module for the analytics page
 */
var analyticsModule = angular.module('bluebox.analytics', [
        'ui.router',
        'ngMaterial'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("analyticsState", {
            url:            "/analytics",
            templateUrl:    "angular/modules/analytics/analytics.html",
            controller:     "AnalyticsController"
        });
    }])
    
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);