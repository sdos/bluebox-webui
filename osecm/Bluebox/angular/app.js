'use strict';

var app = angular.module('bluebox', [
    'ngMaterial',
    'bluebox.fileSystem',
    'bluebox.messageBag',
    'bluebox.tasks',
    'bluebox.about',
    'bluebox.analytics',
    'bluebox.account',
    'bluebox.login'
])
    .config(['$locationProvider', '$httpProvider', '$mdThemingProvider', function($locationProvider, $httpProvider, $mdThemingProvider) {
        // remove the '#' in the url that angular else puts in
        // works only if <base href="/"> is set in html head and URL rewriting is set up properly
        $locationProvider.html5Mode(true);
        
        $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('red')
        .backgroundPalette('grey');
        
    }])
    
    .controller('bbController', function($scope, $location, $log, $state) {
    	$scope.$watch('selectedTabIndex', function(current, old) {
            switch (current) {
                case 0:
                    $state.go("fileSystemState");
                    break;
                case 1:
                    $state.go("tasksState");
                    break;
                case 2:
                    $state.go("aboutState");
                    break;
                case 3:
                    $state.go("analyticsState");
                    break;
                case 4:
                    $state.go("accountState");
                    break;
            }
        });
    }
    		
    );

app.constant('BACKEND_BASE_URL', '/swift/');