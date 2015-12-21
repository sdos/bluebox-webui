"use strict";

/**
 * urlEncode filter
 * filter that encodes a string for safe usage inside urls
 */
filterModule.filter('urlEncode', function() {
    return window.encodeURIComponent;
});