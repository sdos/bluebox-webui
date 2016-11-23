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
        var lastToast;
        function showMessageSuccess(message) {
            $mdToast.hide(lastToast);
            lastToast = $mdToast.show({
                hideDelay: 2000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                template: '<md-toast><md-icon md-font-set="material-icons" style="color: green;">check_circle</md-icon><span class="md-toast-text" flex>{{message.text}}</span></md-toast>'
            });
        };
        function showMessageWarning(message) {
            $mdToast.hide(lastToast);
            lastToast = $mdToast.show({
                hideDelay: 5000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                template: '<md-toast><md-icon md-font-set="material-icons" style="color: red;">error</md-icon><span class="md-toast-text" flex>{{message.text}}</span></md-toast>'
            });
        };
        function showMessageWait(message) {
            $mdToast.hide(lastToast);
            lastToast = $mdToast.show({
                hideDelay: 1000,
                position: 'bottom left',
                controller: 'ToastCtrl',
                locals: {message: message},
                template: '<md-toast><md-icon md-font-set="material-icons" style="color: yellow;">hourglass_full</md-icon><span class="md-toast-text" flex>{{message.text}}</span></md-toast>'
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

