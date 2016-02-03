"use strict";

/**
 * metadata header field filter
 * filter that returns the corresponding metadata header field key for a given object class and metadata field name
 */
containerModule.filter('metadataHeaderField', ["$filter", function($filter) {
    return function (metadataFieldName, objectClass) {
        return "x-object-meta-"
            + (objectClass ? $filter('httpHeaderField')(objectClass) + "-class-" : "")
            + $filter('httpHeaderField')(metadataFieldName);
    }
}]);