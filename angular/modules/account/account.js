'use strict';

/**
 * bluebox.account
 * module for the account page
 */
var accountModule = angular.module('bluebox.account', [
        'ui.bootstrap',
        'ui.router',
        'elif',
        'ngCookies'
    ])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("accountState", {
            url:            "/account",
            templateUrl:    "angular/modules/account/account.html",
            controller:     "AccountController"
        });
    }]);