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
						function($scope, $rootScope, $state, $stateParams,
								$timeout, $filter, $http) {

							console.log("BB-Insights!");
							$scope.nodered = {
								url : "...Endpoint URL unknown..."
							};

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
								$http
										.get('api_analytics/plot/'+plotType, {params:{"nrDataSource": $scope.nrDataSource}})
										.then(
												function successCallback(
														response) {
													$scope.bbplot = response.data[1];
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

							};

						} ]);