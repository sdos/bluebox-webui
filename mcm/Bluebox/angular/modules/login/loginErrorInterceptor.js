/**
 * Created by tim on 30.10.16.
 */

/**
 * intercept http errors and redirect to login page
 */
loginModule
    .factory('loginErrorInterceptor', ['$q', '$injector', '$rootScope', function ($q, $injector, $rootScope) {
        return {

            /*        'response': function (response) {
             console.log("intercept");
             console.log(response.status);
             return response;
             },*/
            'responseError': function (response) {
                console.log("intercept ERROR");
                console.log(response.status);
                console.log(response);

                if (response.status === 401) {
                    s = $injector.get('$state');
                    if (!s.includes('loginState')) {
                        s.go('loginState');
                    }
                    var deferred = $q.defer();
                    return deferred.promise;
                } else {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "warning",
                        "text": "http error: " + response.status + " " + response.data
                    });
                }
                return $q.reject(response);
            }

        };
    }]);