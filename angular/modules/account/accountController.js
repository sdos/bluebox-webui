'use strict';

/**
 * AccountController
 * controller for "account"
 */
accountModule.controller('AccountController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$cookies',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter, $cookies) {

    	console.log("nothing to do here...");
    	
    	$scope.forgetToken = function() {
    		console.log("bye bye token...");
    		$cookies.remove('XSRF-TOKEN');
    		
    		
    	};
            
        }]);