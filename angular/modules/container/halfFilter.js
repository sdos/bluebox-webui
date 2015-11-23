"use strict";

/**
 * half filter
 * filter that returns the half of an array or an object
 *
 * additional parameters:
 *  - {1|2} half the half that shall be returned (optional, default: 1)
 */
containerModule.filter('half', function() {

    /**
     * returns the half of the array
     *
     * @param {Array}   array                 the original array
     * @param {boolean} isSecondHalfRequested if true, the second half will be returned
     * @returns {Array} the requested half of the array
     */
    var getHalfOfArray = function(array, isSecondHalfRequested) {
        return array.slice(
            isSecondHalfRequested * array.length / 2 // 0 if first half, length/2 if second half
            + isSecondHalfRequested * array.length % 2, // if the length is odd, we want the second half to be smaller
            array.length / (2 - isSecondHalfRequested) // length/2 if first half, length if second half
            + !isSecondHalfRequested * array.length % 2 // if the length is odd, we want the first half to be greater
        );
    };

    return function(object, half) {
        // return first half if it is not correctly specified
        var isSecondHalfRequested = half === 2;

        var result;

        if (angular.isArray(object)) {
            result = getHalfOfArray(object, isSecondHalfRequested);
        } else if (angular.isObject(object)) {
            result = _.object(getHalfOfArray(_.pairs(object), isSecondHalfRequested));
        }

        return result;
    };
});