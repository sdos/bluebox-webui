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
            $injector.get('$state').go('loginState', {noAuth: true});
            return $q.reject(response);



        }

    };
}]);