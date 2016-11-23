'use strict';

/**
 * bluebox.messageBag module and directive that handles flash messages
 *
 */
angular.module('bluebox.messageBag', ['ngAnimate', 'ngSanitize']).controller(
    'messageBagController',
    function ($scope, $mdToast, $mdDialog) {


        /**
         *
         * Message receiver
         *
         * */

        $scope.$on('FlashMessage', function (event, message) {
            if ("success" == message.type) showMessageSuccess(message);
            if ("danger" == message.type) showMessageWarning(message);
            if ("warning" == message.type) showMessageWarning(message);
            if ("wait" == message.type) showMessageWait(message);

            console.log(message.type + ": " + message.text);
        });


        /**
         *
         * Handle the toasts
         *    for info etc.
         *
         * */
        function showMessageSuccess(message) {
            $mdToast.show({
                hideDelay: 2000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                templateUrl: 'angular/modules/messageBag/messageBagSuccess.html'
            });
        };
        function showMessageWarning(message) {
            $mdToast.show({
                hideDelay: 5000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                templateUrl: 'angular/modules/messageBag/messageBagWarning.html'
            });
        };
        function showMessageWait(message) {
            $mdToast.show({
                hideDelay: 1000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                templateUrl: 'angular/modules/messageBag/messageBagWait.html'
            });
        };


        /**
         *
         * Handle the dialogs
         *    for errors
         *
         * */
        function showAlert(message) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#messageBagContainer')))
                    .clickOutsideToClose(true)
                    .title('Warning')
                    .textContent(message.text)
                    .ariaLabel('Warning')
                    .ok('Dismiss')
                //.targetEvent(ev)
            );
        };


        /**
         *
         * Controllers
         *
         *
         * */


    }).controller('ToastCtrl', function ($scope, $mdToast, message) {
    $scope.message = message;
    $scope.closeToast = function () {
        $mdToast.hide();
    };
});

