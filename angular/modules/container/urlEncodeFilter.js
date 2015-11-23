"use strict";

/**
 * urlEncode filter
 * filter that encodes a string for safe usage inside urls
 */
containerModule.filter('urlEncode', function() {
    return window.encodeURIComponent;
});