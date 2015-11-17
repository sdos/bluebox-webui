"use strict";

messageBagModule.directive('messageBag', function() {
    return {
        restrict:       'E',
        scope:          {},
        templateUrl:    'angular/modules/messageBag/messageBag.html',
        controller:     ['$scope', '$timeout', function($scope, $timeout) {
            $scope.messages = [];

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