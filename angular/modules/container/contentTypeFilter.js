/**
 * 
 */

"use strict";

containerModule.filter('contentType', function() {
	return function(input) {
		input = input + "";
		var splitArray = input.split("/");
		var result;
		if (splitArray[0] == "text"){
			result = "Text";
		}else if(splitArray[0] == "image"){
			result = splitArray[1].toUpperCase() + "-Image";
		}else if(splitArray[0] == "application"){
			result = "Application";
		}else if(splitArray[0] == "audio"){
			result = "Audio";
		}else if(splitArray[0] == "video"){
			result = "Video";
		}else if(splitArray[0] == "multipart"){
			result = "Multipart";
		}else if(splitArray[0] == "message"){
			result = "Message";
		}else if(splitArray[0] == "model"){
			result = "Model";
		}else{
			result = "Not Defined";
		}			
		
		return result;
	}
});
