"use strict";

containerModule.filter('urlEncode', function() {
    return window.encodeURIComponent;
});