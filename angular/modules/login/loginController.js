'use strict';

/**
 * LoginController
 * controller for login
 */
loginModule.controller('LoginController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http) {

    	console.log("nothing to do here...")
    	
    	
    	
    	$scope.credentials = {};
    	$scope.login = function() {
    		$http.post('swift/login', $scope.credentials)
    		.success(function() {
    				$state.go('fileSystemState');

    		})
    		.error(function(data) {
    			console.log(data);
    			$rootScope.$broadcast('FlashMessage', {
                    "type":     "danger",
                    "text":     "Authentication failed: " + data
                });
    		});
    		
    		
    	}
    	
            
        }]);