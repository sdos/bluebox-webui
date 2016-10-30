'use strict';

var app = angular.module('bluebox', [
    'ngMaterial',
    'ngAnimate',
    'ui.router',
    'bluebox.fileSystem',
    'bluebox.messageBag',
    'bluebox.tasks',
    'bluebox.about',
    'bluebox.analytics',
    'bluebox.account',
    'bluebox.login'
])
    .config(['$locationProvider', '$httpProvider', '$mdThemingProvider', '$urlRouterProvider', function ($locationProvider, $httpProvider, $mdThemingProvider, $urlRouterProvider) {
        // remove the '#' in the url that angular else puts in
        // works only if <base href="/"> is set in html head and URL rewriting is set up properly
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/about");

        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('deep-orange')
            .backgroundPalette('grey');

    }])
    .controller('blueboxController',
        ['$scope', '$state', '$rootScope',
            function ($scope, $state, $rootScope) {
                console.log("Bluebox!");
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    $scope.mainMenuSelected = toState.name;
                    $rootScope.lastState = fromState.name;
                })
            }]);

app.constant('BACKEND_BASE_URL', '/swift/');
app.constant('BACKEND_BASE_URL_METADATA_API', '/api_metadata/');
app.constant('BACKEND_BASE_URL_TASKS_API', '/api_tasks/');
app.constant('CLIENT_ID', Math.random());