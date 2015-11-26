/**
 * 
 * 
 * 
 */
"use strict";

containerModule.filter('bytes', function() {
	return function(input, precision) {
		if (isNaN(parseFloat(input)) || !isFinite(input)) return '-';
		if (typeof precision === 'undefined') precision = 2;
		var units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(input) / Math.log(1024));
		var result = (input / Math.pow(1024, Math.floor(number))).toFixed(precision);
		if (isNaN(result)) return "0.00" + " " + units[0];
		return result + ' ' + units[number];
	}
});
