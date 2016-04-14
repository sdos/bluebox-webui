'use strict';

/**
 * bluebox.login
 * module for the login page
 */
var loginModule = angular.module('bluebox.login', [
        'ui.router'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("loginState", {
            url:            "/login",
            templateUrl:    "angular/modules/login/login.html",
            controller:     "LoginController",
            params:			{
            	noAuth: false
            }
        });
    }]);