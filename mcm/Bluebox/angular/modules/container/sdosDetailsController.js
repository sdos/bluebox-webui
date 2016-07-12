'use strict';


function sdosDetailsController($scope, $http, $mdMedia, $mdDialog) {
    console.log("SDOS");
    var ctrl = this;
    $scope.sdosStats = null;
    $scope.sdosUsedPartitions = null;
    $scope.sdosPartitionMapping = null;
    $scope.container = ctrl.container;
    $scope.availableSlotBlockCounts = [10, 100, 1000, 10000];
    $scope.slotBlockCount = $scope.availableSlotBlockCounts[2];

    function getSdosStats() {
        $http
            .get('swift/containers/' + ctrl.container.name + '/objects/__mcm__/sdos_cascade_stats')
            .then(
                function successCallback(response) {
                    $scope.sdosStats = response.data;

                },
                function errorCallback(response) {
                    console.error("ERROR GETTING DETAILS FROM SERVER: " + response.data);
                });

    };
    


    $scope.getSdosSlotAllocation = function () {

        $scope.sdosSlotAllocation = undefined;
        $http
            .get('swift/containers/' + ctrl.container.name + '/objects/__mcm__/sdos_slot_utilization' + $scope.slotBlockCount)
            .then(
                function successCallback(response) {
                    $scope.sdosSlotAllocation = response.data;

                },
                function errorCallback(response) {
                    console.error("ERROR GETTING DETAILS FROM SERVER: " + response.data);
                });

    };

    $scope.showCascadeSheet = function (ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: SdosSheetController,
            templateUrl: 'angular/modules/container/sdosCascadeSheet.html',
            parent: angular.element(document.body),
            targetEvent: ev,
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
    };

    $scope.showMappingSheet = function (ev) {
        $scope.getSdosSlotAllocation();
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: SdosSheetController,
            templateUrl: 'angular/modules/container/sdosMappingSheet.html',
            parent: angular.element(document.body),
            targetEvent: ev,
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
    };


    $scope.$watch('container.objects', function() {
        console.log("refreshing SDOS stats");
        getSdosStats();
    })
}

angular.module('bluebox.container').component('sdosDetails', {
    templateUrl: 'angular/modules/container/sdosDetails.html',
    controller: sdosDetailsController,
    bindings: {
        container: '<'
    }
}).component('mcmMetaContainer', {
    templateUrl: 'angular/modules/container/mcmMetaContainer.html',
    bindings: {
        container: '<'
    }
});









