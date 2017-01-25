'use strict';


function sdosDetailsController($scope, $rootScope, $http, $mdMedia, $mdDialog) {
    console.log("SDOS");
    var ctrl = this;
    $scope.sdosStats = null;
    $scope.sdosUsedPartitions = null;
    $scope.sdosPartitionMapping = null;
    $scope.container = ctrl.container;
    $scope.availableSlotBlockCounts = [10, 100, 1000, 10000];
    $scope.slotBlockCount = $scope.availableSlotBlockCounts[2];


    /*
     *
     * key management
     *
     * */


    $scope.provideNextDeletable = function (ev) {
        var confirm = $mdDialog.prompt()
            .title('Provide the next deletable key for ' + ctrl.container.name)
            .textContent('The deletable key is a passphrase; please enter the next passphrase. Once you trigger secure deletion, the master key will be replaced and encrypted with this next/new deletable key.')
            .placeholder('passphrase')
            .ariaLabel('passphrase')
            .targetEvent(ev)
            .ok('Check in')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function (result) {
            pseudoObjectPost("next_deletable", result);
        });
    };


    $scope.unlockMasterKey = function (ev) {
        // if the deletable key is a passphrase, we need to prompt for it
        if ($scope.sdosStats.masterKeySource.type == "static") {
            var confirm = $mdDialog.prompt()
                .title('Unlock the master key for ' + ctrl.container.name)
                .textContent('The deletable key is a passphrase; please enter it')
                .placeholder('passphrase')
                .ariaLabel('passphrase')
                .targetEvent(ev)
                .ok('Unlock')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function (result) {
                pseudoObjectPost("masterkey_unlock", result);
            });
        }
        else {
            pseudoObjectPost("masterkey_unlock");
        }
    };

    $scope.lockMasterKey = function () {
        pseudoObjectPost("masterkey_lock");
    };

    function pseudoObjectPost(operation, passphrase) {
        var d = {
            'metadata': {
                'x-object-meta-dummy': "for swift API compliance"
            }
        };
        if (passphrase) {
            d.metadata['x-object-meta-passphrase'] = passphrase;
        }
        console.log(passphrase)
        console.log(d)
        $http
            .post('swift/containers/' + ctrl.container.name + '/objects/__mcm__/sdos_' + operation, d)
            .then(
                function successCallback(response) {
                    getSdosStats();
                });
    };


    /*
     *
     * Stats / Info retrieval
     *
     * */

    function getSdosStats() {
        $http
            .get('swift/containers/' + ctrl.container.name + '/objects/__mcm__/sdos_cascade_stats')
            .then(
                function successCallback(response) {
                    $scope.sdosStats = response.data;
                    if ($scope.sdosStats.masterKeySource) {
                        $scope.sdosStats.masterKeySource.keyIdColor = '#' + $scope.sdosStats.masterKeySource.key_id.substring(0, 6);
                    }

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

    $scope.showCascadeSheet = function (ev, object) {
        $scope.selectedObjectInCascade = object;
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

    $rootScope.showCascadeSheet = $scope.showCascadeSheet;

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


    $scope.$watch('container.objects', function () {
        console.log("refreshing SDOS stats");
        getSdosStats();
    });

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









