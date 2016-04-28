'use strict';

/**
 * AnalyticsController controller for "analytics"
 */
analyticsModule
		.controller(
				'AnalyticsController',
				[
						'$scope',
						'$rootScope',
						'$state',
						'$stateParams',
						'$timeout',
						'$filter',
						'$http',
						'$location',
						'$mdDialog',
						'$mdMedia',
						function($scope, $rootScope, $state, $stateParams,
								$timeout, $filter, $http , $location, $mdDialog, $mdMedia) {
							
							$scope.waitingForPlot = false;

							console.log("BB-Insights!");
							updateNodeRedSources();
							$scope.nodered = {
								url : "...Endpoint URL unknown..."
							};
							// $scope.selectedSource = {url:"", name: "",
							// initialLabel: "Select your data source here"};

							$http
									.get('api_analytics/nrendpoint')
									.then(
											function successCallback(response) {
												console.log("endpoint is at: "
														+ response.data.url);
												$scope.nodered = {
													url : response.data.url
												};
												if (!response.data.url) {
													$rootScope
															.$broadcast(
																	'FlashMessage',
																	{
																		"type" : "danger",
																		"text" : "Error communicating with analytics back end"
																	});
												}
											},
											function errorCallback(response) {
												$rootScope
														.$broadcast(
																'FlashMessage',
																{
																	"type" : "danger",
																	"text" : "Error communicating with analytics back end: "
																			+ response
																});
											});

							$scope.drawPlot = function(plotType) {
								$scope.waitingForPlot = true;
								$http
										.get(
												'api_analytics/plot/'
														+ plotType,
												{
													params : {
														"nrDataSource" : $scope.selectedSource
													}
												})
										.then(
												function successCallback(
														response) {
													$scope.bbplot = response.data[1];
													$scope.waitingForPlot = false;

													// There has to be a better
													// way...
													setTimeout(function() {

														eval(response.data[0]);

													}, 100);

													if (!response.data) {
														$rootScope
																.$broadcast(
																		'FlashMessage',
																		{
																			"type" : "danger",
																			"text" : "No data received from backend"
																		});
													}
												},
												function errorCallback(response) {
													$scope.waitingForPlot = false;
													console
															.log(JSON
																	.stringify(response));
													if (420 == response.status) {

													}
													$rootScope
															.$broadcast(
																	'FlashMessage',
																	{
																		"type" : "danger",
																		"text" : "Error: "
																				+ response.data,
																		timeout : 30000
																	});
												});

							};

							$scope.updateNodeRedSources = updateNodeRedSources;

							function updateNodeRedSources() {
								$http
										.get('api_analytics/nrsources')
										.then(
												function successCallback(
														response) {
													console.log(response.data);
													$scope.availableSources = response.data;

													if (!response.data) {
														$rootScope
																.$broadcast(
																		'FlashMessage',
																		{
																			"type" : "danger",
																			"text" : "unable to retrieve Node-RED endpoint list..."
																		});
													}
												},
												function errorCallback(response) {
													console
															.log(JSON
																	.stringify(response));
													$rootScope
															.$broadcast(
																	'FlashMessage',
																	{
																		"type" : "danger",
																		"text" : "Error: "
																				+ response.data
																	});
												});
							};

                            // retrieve table structure from the analytics data base
							$scope.showTableStructure = function(){

    	                        $http.get('api_analytics/tablestructure').then(

    	                            function successCallback(response){

                                        console.log(response.data)

    	                                $scope.tableData = response.data;

    	                                if(!response.data){
    	                                    $rootScope.$broadcast(
    	                                        'FlashMessage',{
    	                                        'type' : 'danger',
    	                                        'text' : 'unable to retrieve data tables'}
    	                                        );
    	                                }
    	                            },

    	                            function errorCallback(response){
    	                                console.log(JSON.stringify(response));

    	                                $rootScope.broadcast(
    	                                    'FlashMessage', {
    	                                    'type' : 'danger',
    	                                    'text' : 'Error: ' + response.data
    	                                    });
    	                            }

    	                        );

    	                    };


    	                    /**
                             *
                             * Detail Sheet...
                             *
                             */
                             $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

                            $scope.showDetailSheet = function(event) {

                                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
                                $mdDialog.show({
                                    controller: AnalyticsDialogController,
                                    templateUrl: 'angular/modules/analytics/tableStructure.html',
                                    parent: angular.element(document.body),
                                    targetEvent: event,
                                    clickOutsideToClose:true,
                                    fullscreen: useFullScreen,
                                    scope: $scope,
                                    preserveScope: true,
                                    locals: {containerService: containerService}
                                })
                                .then(
                                        function() {
                                            console.log('You cancelled the dialog.');
                                        });

                                $scope.$watch(function() {
                                    return $mdMedia('xs') || $mdMedia('sm');
                                }, function(wantsFullScreen) {
                                    $scope.customFullscreen = (wantsFullScreen === true);
                                });
                            };

						}]);