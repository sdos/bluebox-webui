'use strict';


function sdosDetailsController($scope, $rootScope, $http, $mdMedia, $mdDialog) {
    console.log("SDOS");
    var ctrl = this;
    $scope.sdos_cascade_stats = null;
    $scope.sdos_batch_delete_log = null;
    $scope.sdos_used_partitions = null;
    $scope.sdos_partition_mapping = null;
    $scope.container = ctrl.container;
    $scope.availableSlotBlockCounts = [10, 100, 1000, 10000];
    $scope.slotBlockCount = $scope.availableSlotBlockCounts[2];


    /*
     *
     * key management
     *
     * */


    $scope.batch_delete_start = function (ev) {
        pseudoObjectPost("batch_delete_start");
    }


    $scope.provideNextDeletable = function (ev) {
        var confirm = $mdDialog.prompt()
            .title('Provide the next deletable key for "' + ctrl.container.name + '"')
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

    $scope.clearNextDeletable = function (ev) {
        pseudoObjectPost("clear_next_deletable");
    };


    $scope.unlockMasterKey = function (ev) {
        // if the deletable key is a passphrase, we need to prompt for it
        if ($scope.sdos_cascade_stats.masterKeySource.type == "passphrase") {
            var confirm = $mdDialog.prompt()
                .title('Unlock the master key for "' + ctrl.container.name + '"')
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

    function getCryptoStats() {
    };

    function getSdosStats() {
        $http
            .get('swift/containers/' + ctrl.container.name + '/objects/__mcm__/sdos_cascade_stats')
            .then(
                function successCallback(response) {
                    $scope.sdos_cascade_stats = response.data;
                    if ($scope.sdos_cascade_stats.masterKeySource) {
                        $scope.sdos_cascade_stats.masterKeySource.keyIdColor = '#' + $scope.sdos_cascade_stats.masterKeySource.key_id.substring(0, 6);
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

    $scope.showDebugSheet = function (ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: SdosSheetController,
            templateUrl: 'angular/modules/container/sdosDebugSheet.html',
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
        if ($scope.container.isSdos) {
            getSdosStats();
        }
        else if ($scope.container.isCrypto) {
            getCryptoStats();
        }

    });

}

angular.module('bluebox.container')
    .component('sdosDetails', {
        templateUrl: 'angular/modules/container/sdosDetails.html',
        controller: sdosDetailsController,
        bindings: {
            container: '<'
        }
    })
    .component('cryptoDetails', {
        templateUrl: 'angular/modules/container/cryptoDetails.html',
        controller: sdosDetailsController,
        bindings: {
            container: '<'
        }
    })
    .component('mcmMetaContainer', {
        templateUrl: 'angular/modules/container/mcmMetaContainer.html',
        bindings: {
            container: '<'
        }
    });









