'use strict';

var app = angular.module('bluebox', [
    'bluebox.fileSystem',
    'bluebox.messageBag',
    'bluebox.tasks',
    'bluebox.login'
])
    .config(['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {
        // remove the '#' in the url that angular else puts in
        // works only if <base href="/"> is set in html head and URL rewriting is set up properly
        $locationProvider.html5Mode(true);
        
    }]);

app.constant('BACKEND_BASE_URL', '/swift/');