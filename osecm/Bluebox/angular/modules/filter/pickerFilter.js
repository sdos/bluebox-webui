"use strict";

/**
 * picker filter
 * filter that picks the filter specified by the second argument and filters the given value with that one
 */
filterModule.filter('picker', ['$filter', function($filter) {
    return function(value, filterName) {
        return $filter(filterName) ? $filter(filterName)(value) : value;
    };
}]);