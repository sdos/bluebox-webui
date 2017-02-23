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
                var state = $injector.get('$state');
                if (state.includes('loginState')) return $q.reject(response);
                console.log(response);
                if (response.status === 401) {
                    state.go('loginState');
                    var deferred = $q.defer();
                    return deferred.promise;
                } else if (response.status === -1) {
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "warning",
                        "text": "http error: no connection to service"
                    });
                } else {
                    var text = (response.data.error && response.data.error.message) ? response.data.error.message : response.data;
                    $rootScope.$broadcast('FlashMessage', {
                        "type": "warning",
                        "text": "HTTP error " + response.status + " - " + text
                    });
                }
                return $q.reject(response);
            }

        };
    }]);