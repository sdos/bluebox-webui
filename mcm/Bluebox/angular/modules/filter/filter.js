'use strict';

/**
 * bluebox.filter
 * module for filters used throughout the application
 */
var filterModule = angular.module('bluebox.filter', []).filter('metaPrefix', function () {
    return function (input) {
        return input.replace("x-object-meta-", "");
    }
}).filter('fileTypeIcon', function () {
    return function (input) {
        if (input.startsWith("image/"))                        return "image";
        if (input.startsWith("text/plain"))                    return "description";
        if (input.startsWith("application/pdf"))            return "picture_as_pdf";
        if (input.startsWith("message/rfc822"))                return "email";
        if (input.startsWith("message/rfc822"))                return "email";
        if (input.startsWith("application/octet-stream"))    return "help";
        return "insert_drive_file";
    }
}).filter('containerTypeIcon', function () {
    return function (c) {
        if (c.name.endsWith(".sdos") | c.name.startsWith("_internal_"))                        return "folder_special";
        if (c.count == 0)                                    return "folder_open";
        return "folder";
    }
}).filter('containerTypeColor', function () {
    return function (c) {
        if (c.name.endsWith(".sdos") | c.name.startsWith("_internal_"))                        return "color: grey; font-style: italic;";
        return "";
    }
}).filter('isMetaContainer', function () {
    return function (c) {
        if (c.endsWith(".sdos"))                        return true;
        if (c.startsWith("_internal_"))                        return true;
        return false;
    }
}).filter('numberFormat', function () {
    return function (c) {
        if (parseInt(c) > 1000)                     return parseInt(c).toLocaleString('en-US', {minimumFractionDigits: 0});
        return c;
    }
});