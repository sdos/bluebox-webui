'use strict';

var app = angular.module('bluebox', [
    'bluebox.fileSystem',
    'bluebox.container'
])
    .config(['$locationProvider', function($locationProvider) {
        // remove the '#' in the url that angular else puts in
        // works only if <base href="/"> is set in html head
        $locationProvider.html5Mode(true);
    }]);