'use strict';

/**
 * bluebox.messageBag module and directive that handles flash messages
 * 
 */
angular.module('bluebox.messageBag', [ 'ngAnimate', 'ngSanitize' ]).controller(
		'messageBagController',
		function($scope, $mdToast, $mdDialog, $mdMedia) {



			/**
			 * 
			 * Message receiver
			 * 
			 * */

			$scope.$on('FlashMessage', function(event, message) {
				if ("success" == message.type) showMessage(message);
				if ("danger" == message.type) showAlert(message);
				if ("warning" == message.type) showAlert(message);

				console.log(message.type + ": " + message.text);
			});	



			/**
			 * 
			 * Handle the toasts
			 * 	for info etc.
			 * 
			 * */
			function showMessage(message) {
				$mdToast.show({
					hideDelay   : 5000,
					position    : 'bottom left',
					controller  : 'ToastCtrl',
					locals: {message: message},
					templateUrl : 'angular/modules/messageBag/messageBag.html'
				});
			};



			/**
			 * 
			 * Handle the dialogs
			 * 	for errors
			 * 
			 * */
			function showAlert(message) {
				$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.querySelector('#messageBagContainer')))
						.clickOutsideToClose(true)
						.title('Problem...')
						.textContent(message.text)
						.ariaLabel('Problem...')
						.ok('Got it!')
						//.targetEvent(ev)
				);
			};



			/**
			 * 
			 * Controllers
			 * 
			 * 
			 * */  


		}).controller('ToastCtrl', function($scope, $mdToast, message) {
			$scope.message = message;
			$scope.closeToast = function() {
				$mdToast.hide();
			};
		});

