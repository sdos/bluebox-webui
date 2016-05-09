'use strict';

/**
 * AccountController
 * controller for "account"
 */
accountModule.controller('AccountController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$filter',
    '$cookies',
    '$http',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $filter,
              $cookies, $http) {

        console.log("Hello, AccountController");

        var c = $cookies.get('XSRF-TOKEN');

        $scope.tokenText = c ? c : "None";

        $scope.forgetToken = function () {
            console.log("bye bye token...");
            $cookies.remove('XSRF-TOKEN');
            $scope.tokenText = "None";

        };


        $scope.rcFileContent = "";

        /**
         *
         * Get the connection details from the back end
         *
         * */
        function updateRcFileContent() {
            $http
                .get('api_account/account')
                .then(
                    function successCallback(response) {
                        $scope.rcFileContent = (response.data) ? response.data : "COULD NOT GET DETAILS FROM SERVER";

                    },
                    function errorCallback(response) {
                        $scope.rcFileContent = "ERROR GETTING DETAILS FROM SERVER: " + response.data;
                    });

        };
        updateRcFileContent();

    }]);