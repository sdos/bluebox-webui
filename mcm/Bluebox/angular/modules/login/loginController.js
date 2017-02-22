'use strict';

/**
 * LoginController
 * controller for login
 */
loginModule.controller('LoginController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter', '$http', '$cookies', 'MY_DEFAULT_TENANT_NAME',
        function ($scope, $rootScope, $state, $stateParams, $timeout, $filter, $http, $cookies, MY_DEFAULT_TENANT_NAME) {
            console.log("loginController init");
            if ($stateParams.noAuth) {
                $rootScope.$broadcast('FlashMessage', {
                    "type": "success",
                    "text": "Authentication required"
                });
            }

            $scope.credentials = {tenant: MY_DEFAULT_TENANT_NAME};

            /**
             *
             * we get the tenant ID from the back end at the moment, then set this in a cookie
             * this is the "default" tenant ID. others can be set here as well. bluebox supports any tenant ID
             * other parts of MCM currently assume "test" is the tenant ID.
             *
             * */

            /*            $http.get('api_account/tenant')
             .then(
             function successCallback(response) {
             //console.log(response.data);
             $scope.credentials.tenant = response.data;
             $cookies.put('MCM-TENANT', response.data);

             if (!response.data) {
             $rootScope.$broadcast('FlashMessage', {
             "type": "danger",
             "text": "unable to retrieve tenant name"
             });
             }
             });
             */

            $scope.login = function () {
                $http.post('api_account/login', $scope.credentials)
                    .then(function (success) {
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "success",
                                "text": "Authentication successful"
                            });
                            var goBackState = $rootScope.lastState ? $rootScope.lastState : "accountState";
                            $state.go(goBackState);

                        },
                        function (err) {
                            console.log(err);
                            $rootScope.$broadcast('FlashMessage', {
                                "type": "danger",
                                "text": "Authentication failed: " + err
                            });
                        });


            }


        }]);