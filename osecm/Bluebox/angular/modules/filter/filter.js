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
});