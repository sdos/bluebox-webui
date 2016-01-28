"use strict";

/**
 * bluebox.infiniteScroll
 * module and directive for infinite scrolling
 * adopted from https://github.com/sparkalow/angular-infinite-scroll
 *
 * usage:
 *      <div infinite-scroll="addItems()" threshold="100" can-load="true" global>...</div>
 *
 * attrs:
 *  - infinite-scroll:  the expression to evaluate when the bottom is reached
 *  - threshold:        number of pixels away from the bottom the expression shall be evaluated
 *  - can-load:         boolean expression to determine whether the expression can be evaluated
 *  - global:           flag. if set, the infinite scroll applies to the whole page, else only to the element it is applied on
 */
angular.module('bluebox.infiniteScroll', [])
    .directive('infiniteScroll', ['$window', '$document', function ($window, $document) {
        return {
            link: function(scope, element, attrs) {

                /**
                 * the threshold distance from the bottom, default: 0
                 * @type {Number|number}
                 */
                var offset = parseInt(attrs.threshold) || 0;

                /**
                 * the plain element without the angular wrapping
                 * @type {object}
                 */
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