'use strict';

/**
 * bluebox.messageBag module and directive that handles flash messages
 * 
 */
angular.module('bluebox.messageBag', [ 'ngAnimate', 'ngSanitize' ]).controller(
		'messageBagController',
		function($scope, $mdToast) {
			
			function showMessage(message) {
				$mdToast.show({
			          hideDelay   : 5000,
			          position    : 'bottom left',
			          controller  : 'ToastCtrl',
			          locals: {message: message},
			          templateUrl : 'angular/modules/messageBag/messageBag.html'
			        });
			};
			
			
			$scope.$on('FlashMessage', function(event, message) {
				showMessage(message);
				console.log(message.type + ": " + message.text);
			});
			
			

		}).controller('ToastCtrl', function($scope, $mdToast, message) {
			$scope.message = message;
			if ("danger" == message.type) $scope.icon = {name: 'error', style: 'md-warn'};
			if ("success" == message.type) $scope.icon = {name: 'info', style: 'md-accent'};
			
			
			$scope.closeToast = function() {
				$mdToast.hide();
			};
});

