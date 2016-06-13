"use strict";

/**
 * HTML header field filter
 * filter that filters a string for safe usage as a HTTP header field key
 */
containerModule.filter('httpHeaderField', ["$filter", function($filter) {
    return function (str) {
        return $filter("lowercase")(
            str
                .replace(/\s+/g, '-') // collapse multiple whitespaces to a single one and replace with "-"
                .replace(/ä/g, "ae")
                .replace(/ö/g, "oe")
                .replace(/ü/g, "ue")
                .replace(/ß/g, "ss")
                .replace(/[^a-zA-Z0-9-]/g, "") // remove special characters
        );
    }
}]);