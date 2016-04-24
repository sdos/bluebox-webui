'use strict';

/**
 * AboutController
 * controller for "about"
 */
schemaViewerModule.controller('schemaViewerController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$filter','$location', '$anchorScroll',
        function($scope, $rootScope, $state, $stateParams, $timeout, $filter, $location, $anchorScroll) {

    	console.log("load data Table...");

    	$scope.scrollDown = function(){
    	    console.log('hier koennte ihre rapline stehen');

    	    // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('bottom');

            // call $anchorScroll()
            $anchorScroll();

            console.log('Rider on the storm')
    	};
            
        }]);