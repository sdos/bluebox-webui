/**
 * Created by tim on 30.10.16.
 */

/**
 * intercept http errors and redirect to login page
 */
loginModule
    .factory('loginErrorInterceptor', ['$q', '$injector', function ($q, $injector) {
    return {

        'response': function (response) {
            console.log("intercept");
            console.log(response.status);
            return response;
        },
                'responseError': function (response) {
            console.log("intercept ERROR");
            console.log(response.status);
                    s = $injector.get('$state');
            if(response.status == 401 && ! s.includes('loginState')){
                s.go('loginState');
                return;
            }

            return $q.reject(response);



        }

    };
}]);