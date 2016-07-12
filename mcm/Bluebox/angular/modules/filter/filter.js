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
        if (c.name.startsWith("_mcm-internal_"))             return "folder_special";
        if (c.count == 0)                                    return "folder_open";
        return "folder";
    }
}).filter('containerTypeColor', function () {
    return function (c) {
        if (c.name.startsWith("_mcm-internal_"))             return "color: grey; font-style: italic;";
        return "";
    }
}).filter('isMetaContainer', function () {
    return function (c) {
        if (c.startsWith("_mcm-internal_"))             return true;
        return false;
    }
}).filter('numberFormat', function () {
    return function (c) {
        if (parseInt(c) > 1000)                     return parseInt(c).toLocaleString('en-US', {minimumFractionDigits: 0});
        return c;
    }
}).filter('paintBlocks', function () {
    return function (c) {
        return c.replace(/0/g, "<span class='bbBlock0'>&nbsp;0&nbsp;</span> ")
            .replace(/1/g, "<span class='bbBlock1'>&nbsp;1&nbsp;</span> ")
            .replace(/2/g, "<span class='bbBlock2'>&nbsp;2&nbsp;</span> ")
            .replace(/3/g, "<span class='bbBlock3'>&nbsp;3&nbsp;</span> ")
            .replace(/4/g, "<span class='bbBlock4'>&nbsp;4&nbsp;</span> ")
            .replace(/5/g, "<span class='bbBlock5'>&nbsp;5&nbsp;</span> ")
            .replace(/6/g, "<span class='bbBlock6'>&nbsp;6&nbsp;</span> ")
            .replace(/7/g, "<span class='bbBlock7'>&nbsp;7&nbsp;</span> ")
            .replace(/8/g, "<span class='bbBlock8'>&nbsp;8&nbsp;</span> ")
            .replace(/9/g, "<span class='bbBlock9'>&nbsp;9&nbsp;</span> ")
    }
});