"use strict";

var angular = require("angular");

angular.module('gstats.commit-list').component('commitList', {
    templateUrl: "commit-list/commit-list.html",
    controller: "gstats.commitListController",

    bindings: {
        series: '<'
    }
});
