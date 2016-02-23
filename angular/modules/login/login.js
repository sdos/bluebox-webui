'use strict';

/**
 * bluebox.login
 * module for the login page
 */
var loginModule = angular.module('bluebox.login', [
        'ngFileUpload',
        'ui.bootstrap',
        'ui.router',
        'elif'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("loginState", {
            url:            "/login",
            templateUrl:    "angular/modules/login/login.html",
            controller:     "LoginController"
        });
    }]);