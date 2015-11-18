"use strict";

/**
 * module and directive for infinite scrolling
 * adapted from https://github.com/sparkalow/angular-infinite-scroll
 */
angular.module('infiniteScroll', [])
    .directive('infiniteScroll', ['$window', '$document', function ($window, $document) {
        return {
            link: function(scope, element, attrs) {
                var offset = parseInt(attrs.threshold) || 0;
                var e = element[0];

                // if attribute 'global' is given, the infinite scroll shall apply to the entire document
                if ('global' in attrs) {
                    $document.bind('scroll', function() {
                        if (
                            scope.$eval(attrs.canLoad)
                            && (
                                // some browsers place the overflow at the body, some at the <html> element
                                $document[0].body.scrollTop + $window.innerHeight >= $document[0].body.scrollHeight - offset
                                || $document[0].documentElement.scrollTop + $window.innerHeight >= $document[0].documentElement.scrollHeight - offset
                            )
                        ) {
                            scope.$apply(attrs.infiniteScroll);
                        }
                    });
                } else {
                    element.bind('scroll', function () {
                        if (scope.$eval(attrs.canLoad) && e.scrollTop + e.clientHeight >= e.scrollHeight - offset) {
                            scope.$apply(attrs.infiniteScroll);
                        }
                    });
                }
            }
        };
    }]);