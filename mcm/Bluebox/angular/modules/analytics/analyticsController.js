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
            'HTTP_NODERED_PORT',
            'MY_PUBLIC_HOSTNAME',
            'fileSystemService',
            function ($scope, $rootScope, $state, $stateParams,
                      $timeout, $filter, $http, $location, $mdDialog, $mdMedia, HTTP_NODERED_PORT, MY_PUBLIC_HOSTNAME, fileSystemService) {

                $scope.waitingForPlot = false;
                $scope.waitingForTable = false;
                $scope.nodered = {
                    url: "http://" + MY_PUBLIC_HOSTNAME + ":" + HTTP_NODERED_PORT
                };

                $scope.current_plot_type = undefined;
                console.log("Analytics!");


                $scope.$watch('selected_source', function () {
                    update_view();

                });
                $scope.$watch('selected_container', function () {
                    update_view();

                });


                var update_view = function () {
                    if ($scope.current_plot_type) {
                        $scope.drawPlot($scope.current_plot_type);
                    }
                    if ($scope.table_on) {
                        $scope.showResultTable();
                    }
                };


                /**
                 *
                 * Draws the plot. Get the data from backend and run bokeh
                 *
                 * */
                function find_source_object() {
                    //console.log($scope.available_sources)
                    var s = undefined;
                    $scope.available_sources.forEach(function (element) {
                        if (element.url == $scope.selected_source) {
                            s = element;
                        }
                    });
                    return s;
                };

                $scope.drawPlot = function (plotType) {
                    //$scope.bbTableData = undefined;
                    $scope.current_plot_type = plotType;
                    $scope.waitingForPlot = true;
                    $http
                        .get('api_analytics/plot',
                            {
                                params: {
                                    "nrDataSource": find_source_object(),
                                    "plotType": plotType,
                                    "container_filter": $scope.selected_container
                                }
                            })
                        .then(
                            function successCallback(response) {
                                //console.log(response.data);
                                $scope.bbplot = response.data[1];
                                $scope.waitingForPlot = false;
                                // There has to be a better
                                // way...
                                setTimeout(function () {
                                    try {
                                        eval(response.data[0]);
                                    } catch (e) {
                                        console.log(e);
                                        $rootScope
                                            .$broadcast(
                                                'FlashMessage',
                                                {
                                                    "type": "danger",
                                                    "text": "Bokeh frontend could not display the data."
                                                });
                                        $scope.waitingForPlot = false;
                                        $scope.bbplot = undefined;
                                    }
                                }, 100);


                            }, function e(err) {
                                console.log(e)
                                $scope.waitingForPlot = false;
                                $scope.bbplot = undefined;
                            });

                };
                /**
                 *
                 * Draws the plot. Get the data from backend and run bokeh
                 *
                 * */

                $scope.showResultTable = function () {
                    //$scope.bbplot = undefined;
                    $scope.waitingForTable = true;
                    $http
                        .get('api_analytics/table',
                            {
                                params: {
                                    "nrDataSource": find_source_object(),
                                    "container_filter": $scope.selected_container
                                }
                            })
                        .then(
                            function successCallback(response) {
                                //console.log(response);
                                $scope.bbTableData = {
                                    table: JSON.parse(response.data.table),
                                    info: response.data.info,
                                    truncated: response.data.truncated
                                };
                                //console.log($scope.bbTableData);
                                $scope.waitingForTable = false;
                            }, function error(e) {
                                console.log(e)
                                $scope.bbTableData = undefined;

                            });

                };

                /**
                 *
                 * Get the list of Node-RED endoints for the list
                 *
                 * */
                $scope.updateNodeRedSources = function () {
                    $http
                        .get('api_analytics/nrsources')
                        .then(
                            function successCallback(response) {
                                //console.log(response.data);
                                var new_sources = response.data;
                                if (!$scope.available_sources) {
                                    $scope.available_sources = new_sources;
                                    //$scope.selected_source = $scope.available_sources[0].url;
                                    $scope.selected_source = "/default";
                                } else {
                                    $scope.available_sources = new_sources;
                                }

                            });
                };
                $scope.updateNodeRedSources();
                /**
                 *
                 * Get the list of container from swift
                 *
                 * */

                $scope.update_containers = function () {
                    fileSystemService.getContainers("", "", 10000)
                        .then(function (response) {
                            var new_container_names = []
                            response.containers.forEach(function (element) {
                                new_container_names.push(element.name);
                            });
                            if (!$scope.available_containers) {
                                $scope.available_containers = new_container_names;
                                // this indicates the "none" filter where no container is selected
                                $scope.available_containers.push("");
                                $scope.selected_container = "";
                            } else {
                                $scope.available_containers = new_container_names;
                            }


                        })
                };
                $scope.update_containers();


                /**
                 *
                 * Detail Sheet...
                 *
                 */

                $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

                $scope.showTableStructure = function (event) {
                    $http.get('api_analytics/tablestructure').then(
                        function successCallback(response) {
                            //console.log(response.data)
                            $scope.tableData = response.data;

                            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                            $mdDialog.show({
                                controller: AnalyticsDialogController,
                                templateUrl: 'angular/modules/analytics/tableStructureSheet.html',
                                parent: angular.element(document.body),
                                targetEvent: event,
                                clickOutsideToClose: true,
                                fullscreen: useFullScreen,
                                scope: $scope,
                                preserveScope: true
                            });
                            $scope.$watch(function () {
                                return $mdMedia('xs') || $mdMedia('sm');
                            }, function (wantsFullScreen) {
                                $scope.customFullscreen = (wantsFullScreen === true);
                            });
                        }
                    );
                };
            }]);


function AnalyticsDialogController($rootScope, $state, $scope, $mdDialog, $http) {


    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };


};