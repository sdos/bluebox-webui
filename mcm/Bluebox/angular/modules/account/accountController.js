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
    '$mdDialog',
    function ($scope, $rootScope, $state, $stateParams, $timeout, $filter,
              $cookies, $http, $mdDialog) {

        console.log("Hello, AccountController");

        var c = $cookies.get('XSRF-TOKEN');

        $scope.tokenText = c ? c : "None";

        $scope.forgetToken = function () {
            console.log("bye bye token...");
            $cookies.remove('XSRF-TOKEN');
            $cookies.remove('MCM-TENANT');
            $scope.tokenText = "None";

        };


        $scope.rcFileContent = "";
        $scope.tpm_status = "";

        /**
         *
         * Get the connection details from the back end
         *
         * */
        function get_rcfile_content() {
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

        /**
         *
         * Get the connection details from the back end
         *
         * */
        function get_tpm_status() {
            $http
                .get('swift/containers/__mcm-pseudo-container__/objects/tpm_status')
                .then(
                    function successCallback(response) {
                        $scope.tpm_status = response.data;

                    });

        };

        $scope.unlock_tpm = function (ev) {
            var confirm = $mdDialog.prompt()
                .title('Unlock the Trusted Platform Module')
                .textContent('Please enter the Storage Root Key (SRK) password')
                .placeholder('SRK password')
                .ariaLabel('SRK password')
                .targetEvent(ev)
                .ok('Unlock')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (result) {
                pseudoObjectPost("tpm_unlock", result);
            });
        };

        $scope.lock_tpm = function () {
            pseudoObjectPost("tpm_lock");
        };


        function pseudoObjectPost(operation, passphrase) {
            var d = {
                'metadata': {
                    'x-object-meta-dummy': "for swift API compliance"
                }
            };
            if (passphrase) {
                d.metadata['x-object-meta-passphrase'] = passphrase;
            }
            console.log(passphrase)
            console.log(d)
            $http
                .post('swift/containers/__mcm-pseudo-container__/objects/' + operation, d)
                .then(
                    function successCallback(response) {
                        get_tpm_status();
                    });
        };


        get_rcfile_content();
        get_tpm_status();

    }]);