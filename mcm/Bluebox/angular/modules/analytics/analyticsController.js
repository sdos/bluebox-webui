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
            function ($scope, $rootScope, $state, $stateParams,
                      $timeout, $filter, $http, $location, $mdDialog, $mdMedia, HTTP_NODERED_PORT, MY_PUBLIC_HOSTNAME) {

                $scope.waitingForPlot = false;
                $scope.nodered = {
                    url: "http://" + MY_PUBLIC_HOSTNAME + ":" + HTTP_NODERED_PORT
                };

                console.log("Analytics!");

                updateNodeRedSources();


                /**
                 *
                 * Draws the plot. Get the data from backend and run bokeh
                 *
                 * */

                $scope.drawPlot = function (plotType) {
                    $scope.bbTableData = undefined;
                    $scope.waitingForPlot = true;
                    $http
                        .get('api_analytics/plot',
                            {
                                params: {
                                    "nrDataSource": $filter('urlEncode')($scope.selectedSource),
                                    "plotType": $filter('urlEncode')(plotType)
                                }
                            })
                        .then(
                            function successCallback(response) {
                                console.log(response.data);

                                if (!response.data) {
                                    $rootScope
                                        .$broadcast(
                                            'FlashMessage',
                                            {
                                                "type": "danger",
                                                "text": "No data received from backend"
                                            });
                                    $scope.waitingForPlot = false;
                                    return;
                                }


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
                                $scope.waitingForPlot = false;
                            });

                };
                /**
                 *
                 * Draws the plot. Get the data from backend and run bokeh
                 *
                 * */

                $scope.showResultTable = function () {
                    $scope.bbplot = undefined;
                    $scope.waitingForPlot = true;
                    $http
                        .get('api_analytics/table',
                            {
                                params: {
                                    "nrDataSource": $filter('urlEncode')($scope.selectedSource)
                                }
                            })
                        .then(
                            function successCallback(response) {
                                console.log(response);
                                if (!response.data.table) {
                                    $rootScope
                                        .$broadcast(
                                            'FlashMessage',
                                            {
                                                "type": "danger",
                                                "text": "No data received from backend"
                                            });
                                    $scope.waitingForPlot = false;
                                    return;
                                }
                                $scope.bbTableData = {
                                    table: JSON.parse(response.data.table),
                                    info: response.data.info,
                                    truncated: response.data.truncated
                                };
                                //console.log($scope.bbTableData);
                                $scope.waitingForPlot = false;
                            });

                };

                /**
                 *
                 * Get the list of Node-RED endoints for the list
                 *
                 * */
                $scope.updateNodeRedSources = updateNodeRedSources;
                function updateNodeRedSources() {
                    $http
                        .get('api_analytics/nrsources')
                        .then(
                            function successCallback(response) {
                                //console.log(response.data);
                                $scope.availableSources = response.data;
                            });
                };


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

        console.log("Closed Dialog");
    };


};