'use strict';

var app = angular.module('bluebox', [
    'ngMaterial',
    'ui.router',
    'bluebox.fileSystem',
    'bluebox.messageBag',
    'bluebox.tasks',
    'bluebox.about',
    'bluebox.analytics',
    'bluebox.account',
    'bluebox.login'
])
    .config(['$locationProvider', '$httpProvider', '$mdThemingProvider', '$urlRouterProvider', function($locationProvider, $httpProvider, $mdThemingProvider, $urlRouterProvider) {
        // remove the '#' in the url that angular else puts in
        // works only if <base href="/"> is set in html head and URL rewriting is set up properly
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/about");
        
//        $mdThemingProvider.theme('default')
//        .primaryPalette('blue')
//        .accentPalette('red')
//        .backgroundPalette('grey');
        $mdThemingProvider.theme('default')
        .primaryPalette('grey')
        .accentPalette('blue')
        .backgroundPalette('grey');
        
    }]);

app.constant('BACKEND_BASE_URL', '/swift/');
app.constant('BACKEND_BASE_URL_METADATA_API', '/api_metadata/');