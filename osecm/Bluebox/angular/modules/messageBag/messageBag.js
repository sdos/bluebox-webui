'use strict';

/**
 * bluebox.messageBag module and directive that handles flash messages
 * 
 */
angular.module('bluebox.messageBag', [ 'ngAnimate', 'ngSanitize' ]).controller(
		'messageBagController',
		function($scope, $mdToast) {
			
			$scope.go = function(b) {
				console.log(b);
				
			};
			
			var last = {
				bottom : false,
				top : true,
				left : false,
				right : true
			};
			$scope.toastPosition = angular.extend({}, last);
			$scope.getToastPosition = function() {
				sanitizePosition();
				return Object.keys($scope.toastPosition).filter(function(pos) {
					return $scope.toastPosition[pos];
				}).join(' ');
			};
			function sanitizePosition() {
				var current = $scope.toastPosition;
				if (current.bottom && last.top)
					current.top = false;
				if (current.top && last.bottom)
					current.bottom = false;
				if (current.right && last.left)
					current.left = false;
				if (current.left && last.right)
					current.right = false;
				last = angular.extend({}, current);
			}
			function showMessage(message) {
				var pinTo = $scope.getToastPosition();
				$mdToast.show($mdToast.simple().textContent(message)
						.position(pinTo).hideDelay(5000));
			};
			
			
			$scope.$on('FlashMessage', function(event, message) {
				showMessage(message.type + ": " + message.text);
				console.log(message.type + ": " + message.text);
			});
			
			

		}).controller('ToastCtrl', function($scope, $mdToast) {
	$scope.closeToast = function() {
		$mdToast.hide();
	};
});

//
// directive('messageBag', function() {
// return {
// restrict: 'E',
// scope: {
// timeout: "="
// },
// templateUrl: 'angular/modules/messageBag/messageBag.html',
// controller: ['$scope', '$attrs', '$timeout', function($scope, $attrs,
// $timeout) {
//
// /**
// * duration of the fade in transition in ms
// * @type {number}
// */
// var fadeInDuration = 500;
//
// /**
// * currently shown messages
// * @type {Array}
// */
// $scope.messages = [];
//
// /**
// * whether the message bag is fixed to the window top
// * @type {boolean}
// */
// $scope.isFixed = "fixed" in $attrs;
//
// /**
// * whether the messages shall fade in and out
// * @type {boolean}
// */
// $scope.isAnimated = "animated" in $attrs;
//
// /**
// * remove a message
// *
// * @param {number} messageId id of the message to remove
// */
// $scope.close = function(messageId) {
// $scope.messages = _.reject($scope.messages, {id: messageId})
// };
//
// // listen to flash message events
// $scope.$on('FlashMessage', function(event, message) {
// message.id = _.uniqueId();
// message.timeout = angular.isDefined(message.timeout) ? message.timeout :
// $scope.timeout;
// $scope.messages.push(message);
//
// // don't remove the message if the timeout value is NaN
// if (angular.isNumber(message.timeout)) {
// // remove message after the specified timeout
// $timeout(function () {
// $scope.messages = _.reject($scope.messages, {id: message.id})
// }, message.timeout + fadeInDuration);
// }
// });
//
// // listen to events clearing the bag
// $scope.$on('clearMessageBag', function() {
// $scope.messages = [];
// });
// }]
// };
// });
