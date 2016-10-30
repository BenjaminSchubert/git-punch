"use strict";

var angular = require("angular");

/**
 * Filter to order entries by number of commits then by title
 */
angular.module("gstats.commit-list").filter('orderByCommit', function() {
    return function(input) {
        return Object.keys(input)
            .map(function(key) {
                return input[key];
            }).sort(function(a, b) {
                return a.commits > b.commits ? -1: a.commits < b.commits ? 1 : a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
            });
    };
});
