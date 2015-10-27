/*
 * Project Bluebox
 * 2015, University of Stuttgart, IPVS/AS
 * 
 */

/* 
 *	Project Bluebox 
 *	
 *	Copyright (C) <2015> <University of Stuttgart>
 *	
 *	This software may be modified and distributed under the terms
 *	of the MIT license.  See the LICENSE file for details.
 */

/*
 * *********************************************************************
 * *********************************************************************
 * this gets called as soon as the browser has finished parsing the DOM
 * so this is the entry function
 * 
 * 
 */
$(document).ready(function() {
	buildContainerTable();
	$("#SuccessAlert").hide()
	$("#ErrorAlert").hide()
	uploadRequest();
	createRequest();		
});


/*
 * *********************************************************************
 * *********************************************************************
 * clear the entire table
 * 
 */
function clearSwiftTable(){
	$("#swiftList").children().remove();
}


/*
 * *********************************************************************
 * *********************************************************************
 * container table stuff 
 * 
 */
function buildContainerTable(){
	$("#backBtn").hide()
	$("#createContainerDiv").show()
	$("#createContainerForm").show()
	$("#uploadObjectDiv").hide()
	$("#uploadObjectForm").hide()
	$("#checkOldFilesBtn").hide()
	$("#deleteOldFilesBtn").hide()
	$("#SuccessAlert").hide()
	$("#ErrorAlert").hide()
	hideAllPopovers();
	clearSwiftTable();
	$("#SwiftTableHeading h3").html("List of containers");
	
	var t = $("#swiftList");
	buildContainerTableHeader(t);
	buildContainerTableContent(t);
}

function buildContainerTableHeader(table){
	//build header row
	var hr = $('<tr/>');
	hr.append($('<th/>').html("Name"));
	hr.append($('<th/>').html("Size"));
	hr.append($('<th/>').html("Objects"));
	hr.append($('<th/>').html("Enter"));
	table.append(hr);
}

function buildContainerTableContent(table){
	$.get("/swift/containers").success(function(data){
		
		for (var i = 0 ; i < data.length ; i++) {
			var row = $('<tr/>');
			row.append($('<td/>').html(data[i].name));
			row.append($('<td/>').html(fileSizeSI(data[i].bytes)));
			row.append($('<td/>').html(data[i].count));
			row.append($('<td/>')
				.html('<input type="button" class="btn btn-info" value=">>>"/>')
				.data("containerName", data[i].name)
				.click(function() {enterContainer($(this))}));
				
			table.append(row);
		}
	})
}
var containerName;
function enterContainer(d){
	containerName = d.data("containerName");
	buildObjectTable(containerName);
	
}
 

/*
 * *********************************************************************
 * *********************************************************************
 * object table stuff 
 * 
 */
function buildObjectTable(container){
	$("#backBtn").show()
	$("#createContainerDiv").hide()
	$("#createContainerForm").hide()
	$("#uploadObjectDiv").show()
	$("#uploadObjectForm").show()
	$("#checkOldFilesBtn").show()
	$("#deleteOldFilesBtn").show()
	$("#ErrorAlert").hide()
	clearSwiftTable();
	document.getElementById("containerTxtUp").defaultValue = container;
	$("#SwiftTableHeading h3").html("List of objects in container '" + container + "'");
	
	var t = $("#swiftList");
	buildObjectTableHeader(t);
	buildObjectTableContent(t, container);
}

function buildObjectTableHeader(table){
	//build header row
	var hr = $('<tr/>');
	hr.append($('<th/>').html("Name"));
	hr.append($('<th/>').html("Size"));
	hr.append($('<th/>').html("Type"));
	hr.append($('<th/>').html("Download"));
	hr.append($('<th/>').html("Delete"));
	hr.append($('<th/>').html("Details"));
	table.append(hr);
}


var contName;
var objName;

function buildObjectTableContent(table, container){
	$.get("/swift/containers/" + container + "/objects").success(function(data){
		
		for (var i = 0 ; i < data.length ; i++) {
			var row = $('<tr/>');
			row.append($('<td/>').html(data[i].name));
			row.append($('<td/>').html(fileSizeSI(data[i].bytes)));
			row.append($('<td/>').html(data[i].content_type));
			row.append($('<td/>')
				.html('<input type="button" class="btn btn-success" value="GET"/>')
				.data("containerName", container)
				.data("objectName", data[i].name)
				.click(function() {getObject($(this))})
				);
			row.append($('<td/>')
				.html('<input type="button" class="btn btn-danger" value="DELETE"/>')
				.data("containerName", container)
				.data("objectName", data[i].name)
				.click(function() {deleteObject($(this))})
				);
			row.append($('<td/>')
					.html('<input type="button" class="btn btn-info pop-show" data-toggle="popover" id="btnpopover" title="Popover Header" value="DETAILS"/>')
					.data("containerName", container)
					.data("objectName", data[i].name)
					.click(function()                        
                        {  
                        var newdata = $(this);
                        contName = newdata.data("containerName");
                        objName = newdata.data("objectName");
                        $('.pop-show').popover
                        ({
                            html : true,
                            content : function() {
                                return getMetadataDetails(contName,objName)}
                        }).click(function(e) {
                            $(this).popover('toggle');
                            e.stopPropagation();
                        });
                        $('.pop-show').on('click', function (e) {
                               $('.pop-show').not(this).popover('hide');
                            });
                       
                        }));
			table.append(row);
		}
	})
	
}

var convData;
function getMetadataDetails(containerName,objectName){
	var url = "/swift/containers/" + containerName + "/objects/" + encodeURIComponent(objectName) + "/details";
	$.get(url).success(function(data){
		var Datas = eval(data);
		jsData={};
		jsData['ownerName'] = Datas['x-object-meta-ownername'];
		jsData['content-type'] = Datas['content-type'];
		convData = JSON.stringify(jsData);
		return convData;
	});
	return convData;
}

function enterMetadataDetails(d){
	var containerName = d.data("containerName");
	buildObjectTable(containerName);
	
}

function getObject(d){
	var containerName = d.data("containerName");
	var objectName = d.data("objectName");
	var url = "/swift/containers/" + containerName + "/objects/" + encodeURIComponent(objectName);
	window.location.replace(url); 
}

function deleteObject(d){
	var containerName = d.data("containerName");
	var objectName = d.data("objectName");
	var url = "/swift/containers/" + containerName + "/objects/" + encodeURIComponent(objectName);
	$.ajax({
	    url: url,
	    type: 'DELETE',
	    success: function(data) {  
	   
	    	 if (data.deletestatus === "done") {
	    		 
	    		 $("#SuccessAlert").show();
	    		$("#SuccessAlert").html('<strong>Success!</strong> File is successfully deleted!');
	    		 buildObjectTable(containerName);
	    		} else {
	    			
	    	         			
	    			$("#ErrorAlert").show();
	    			$("#ErrorAlert").html('<strong>Error!</strong> The retention date is: '+ data.retention+"\n"+"\n The following time has been left for deletion: \n"+ " weeks: "+data.weeks+"\n days: "+data.days+"\n hours: "+data.hours+"\n minutes: "+data.minutes+"\n seconds: "+data.seconds);
	    		}

	        // Do something with the result
	    }
	});
}


/*
 * *********************************************************************
 * *********************************************************************
 * utility functions
 * 
 */
 
/*
 * from: http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
 * divides an integer by factors of 1000 (or 1024) to match the closest SI unit.
 * --> this function converts "bits/bytes" to kilo/mega/giga/... 
 */
function fileSizeIEC(a,b,c,d,e){
 return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
 +' '+(e?'KMGTPEZY'[--e]+'iB':'Bytes')
}
function fileSizeSI(a,b,c,d,e){
 return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
 +' '+(e?'kMGTPEZY'[--e]+'B':'Bytes')
}


/*
 * *********************************************************************
 * *********************************************************************
 * Checking Old files and deleting old files
 * 
 */
function CheckOldFiles()
{
		var url = "/swift/containers/" + containerName + "/CheckOldFiles/";
		$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(data) {
	    	filelist = data["list"]
	    	alert(JSON.stringify(filelist))
	    	}

		});
}

function DeleteOldFiles()
{
		var url = "/swift/containers/" + containerName + "/DeleteOldFiles/";
		$.ajax({
	    url: url,
	    type: 'Delete',
	    success: function(data) {
	    	filelist = data["list"]
	    	alert(JSON.stringify(filelist))
	    	buildObjectTable(containerName);
	    		}

		});
}


/*
 * *********************************************************************
 * *********************************************************************
 * Creating folders and uploading files
 * 
 */
function createRequest(){
	$('#createContainerForm').submit(function(e){		   
	    $.ajax({
	        url:'/create',
	        type:'post',
	        data:$('#createContainerForm').serialize(),
	        success:function(){
	            alert("success");
	            buildContainerTable();
	        }
	    });
	    e.preventDefault();
	});

}

function uploadRequest(){
	$('#uploadObjectForm').submit(function(e){
		   
	    $.ajax({
	        url:'/upload',
	        type:'post',
	        data:new FormData($(this)[0]),
	        processData:false,
	        contentType:false,
	        success:function(){
	            alert("success");
	            buildObjectTable(containerName);
	        }
	    });
	    e.preventDefault();
	});		
}


function hideAllPopovers(){
    $('.pop-show').each(function() {
         $(this).popover('hide');
     });  
 };




