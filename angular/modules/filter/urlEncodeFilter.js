"use strict";

/**
 * urlEncode filter
 * filter that encodes a string for safe usage inside urls
 */
filterModule.filter('urlEncode', function() {
    return function(str) {
        switch (str) {
            case ".":
                return "%2E";
            case "..":
                return "%2E%2E";
            default:
                return window.encodeURIComponent(str);
        }
    }
});