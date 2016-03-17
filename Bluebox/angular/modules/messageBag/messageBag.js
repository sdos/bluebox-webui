'use strict';

/**
 * bluebox.messageBag
 * module and directive that handles flash messages
 *
 * usages:
 *      <message-bag></message-bag>
 *      <message-bag timeout="3000"></message-bag>
 *      <message-bag timeout="never"></message-bag>
 *      <message-bag fixed></message-bag>
 *      <message-bag animated></message-bag>
 *
 * attrs:
 *  - timeout:  time in ms the message gets dismissed after by default
 *              if the attribute is missing or its value is NaN, the message won't get dismissed automatically
 *  - fixed:    if given, the messages will be fixed to the top of the window, independent of any scrolling
 *  - animated: if given, messages will fade in and out
 *
 * events:
 *  - FlashMessage
 *      to show a message, a 'FlashMessage' event has to be broadcasted to the directive, containing a message as follows:
 *      {
 *          "type":     {string}        "success" | "info" | "warning" | "danger"
 *          "text":     {string}        message text
 *          "timeout":  {string|number} "never" | time in ms the message gets dismissed after
 *                                      (optional, overrides the value passed to the directive)
 *      }
 *
 *  - clearMessageBag
 *      removes all messages from the message bag (no content)
 */
angular.module('bluebox.messageBag', [
    'ngAnimate',
    'ngSanitize'
]).directive('messageBag', function() {
    return {
        restrict:       'E',
        scope:          {
            timeout: "="
        },
        templateUrl:    'angular/modules/messageBag/messageBag.html',
        controller:     ['$scope', '$attrs', '$timeout', function($scope, $attrs, $timeout) {

            /**
             * duration of the fade in transition in ms
             * @type {number}
             */
            var fadeInDuration = 500;

            /**
             * currently shown messages
             * @type {Array}
             */
            $scope.messages = [];

            /**
             * whether the message bag is fixed to the window top
             * @type {boolean}
             */
            $scope.isFixed = "fixed" in $attrs;

            /**
             * whether the messages shall fade in and out
             * @type {boolean}
             */
            $scope.isAnimated = "animated" in $attrs;

            /**
             * remove a message
             *
             * @param {number} messageId id of the message to remove
             */
            $scope.close = function(messageId) {
                $scope.messages = _.reject($scope.messages, {id: messageId})
            };

            // listen to flash message events
            $scope.$on('FlashMessage', function(event, message) {
                message.id = _.uniqueId();
                message.timeout = angular.isDefined(message.timeout) ? message.timeout : $scope.timeout;
                $scope.messages.push(message);

                // don't remove the message if the timeout value is NaN
                if (angular.isNumber(message.timeout)) {
                    // remove message after the specified timeout
                    $timeout(function () {
                        $scope.messages = _.reject($scope.messages, {id: message.id})
                    }, message.timeout + fadeInDuration);
                }
            });

            // listen to events clearing the bag
            $scope.$on('clearMessageBag', function() {
                $scope.messages = [];
            });
        }]
    };
});