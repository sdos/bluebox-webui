"use strict";

/**
 * HTML header field filter
 * filter that filters a string for safe usage as a HTTP header field key
 */
containerModule.filter('httpHeaderField', ["$filter", function($filter) {
    return function (str) {
        return $filter("lowercase")(str.replace(/[^a-zA-Z0-9]/g, "-"));
    }
}]);