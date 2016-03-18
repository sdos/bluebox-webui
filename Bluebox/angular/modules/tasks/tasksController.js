'use strict';

/**
 * TasksController
 * controller for the view of tasks
 */
tasksModule.controller('TasksController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter) {
var socket = io();
    	console.log("hi :)");
    	$scope.rowCollection = [];
    	
    	
          
          
          socket.on('e1', function(msg){
      	    console.log('message: ' + msg);
      	    $scope.rowCollection.push({id: 1, queue: "Identifier", definition: msg, type: "request"});
      	    console.log($scope.rowCollection);
      	  });
          
          socket.on('connection', function(socket){
        	  console.log('connected to socket.io server');
        	});
          
        }]);

