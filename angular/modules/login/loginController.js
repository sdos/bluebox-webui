'use strict';

/**
 * LoginController
 * controller for login
 */
loginModule.controller('LoginController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http) {

    	if ($stateParams.noAuth) {
			$rootScope.$broadcast('FlashMessage', {
                "type":     "danger",
                "text":     "Authentication required"
            });    		
    	}
    	
    	$scope.credentials = {};
    	$scope.login = function() {
    		$http.post('swift/login', $scope.credentials)
    		.success(function() {
    			$rootScope.$broadcast('FlashMessage', {
                    "type":     "success",
                    "text":     "Authentication successful"
                });
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