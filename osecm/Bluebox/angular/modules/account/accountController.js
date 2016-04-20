'use strict';

/**
 * AccountController
 * controller for "account"
 */
accountModule.controller('AccountController', [
		'$scope',
		'$rootScope',
		'$state',
		'$stateParams',
		'$timeout',
		'$filter',
		'$cookies',
		function($scope, $rootScope, $state, $stateParams, $timeout, $filter,
				$cookies) {
			
			console.log("Hello, AccountController");

			var c = $cookies.get('XSRF-TOKEN');

			$scope.tokenText= c ? c : "None";
			
			$scope.forgetToken = function() {
				console.log("bye bye token...");
				$cookies.remove('XSRF-TOKEN');
				$scope.tokenText= "None";

			};

		} ]);