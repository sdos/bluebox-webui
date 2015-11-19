"use strict";

/**
 * messageBag
 * directive that handles flash messages
 *
 * usage:
 *      <message-bag></message-bag>
 *      to show a message, a 'FlashMessage' event has to be broadcasted to the directive, containing a message as follows:
 *      {
 *          "type": {string} "success" | "info" | "warning" | "danger"
 *          "text": {string} message text
 *      }
 */
messageBagModule.directive('messageBag', function() {
    return {
        restrict:       'E',
        scope:          {},
        templateUrl:    'angular/modules/messageBag/messageBag.html',
        controller:     ['$scope', '$timeout', function($scope, $timeout) {

            /**
             * currently shown messages
             * @type {Array}
             */
            $scope.messages = [];

            // listen to flash message events
            $scope.$on('FlashMessage', function(event, message) {
                message.id = _.uniqueId();
                $scope.messages.push(message);

                // remove message after 10 seconds
                $timeout(function() {
                    $scope.messages = _.reject($scope.messages, {id: message.id})
                }, 3000);
            });
        }]
    };
});