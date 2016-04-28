'use strict';

/**
 * bluebox.filter
 * module for filters used throughout the application
 */
var filterModule = angular.module('bluebox.filter', [
]).filter('metaPrefix', function() {
	return function(input) {
		return input.replace("x-object-meta-filter-", "");
	}
}).filter('fileTypeIcon', function() {
	return function(input) {
		if(input.startsWith("image/")) 						return "image";
		if(input.startsWith("text/plain"))					return "description";
		if(input.startsWith("application/pdf")) 			return "picture_as_pdf";
		if(input.startsWith("message/rfc822")) 				return "email";
		if(input.startsWith("application/octet-stream")) 	return "help";
		return "insert_drive_file";
	}
});