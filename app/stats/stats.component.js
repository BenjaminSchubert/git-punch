"use strict";

var angular = require("angular");

/**
 * Component for the stat module
 */
angular.module('gstats.stats').component('gstats.stats.component', {
    templateUrl: "stats/stats.html",
    controller: "gstats.stats.controller"
});
