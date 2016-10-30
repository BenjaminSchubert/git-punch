"use strict";

var angular = require("angular");

/**
 * Component for the commitList module
 */
angular.module('gstats.commit-list').component('commitList', {
    templateUrl: "commit-list/commit-list.html",
    controller: "gstats.commitListController",

    bindings: {
        series: '<',
        title: '<'
    }
});
