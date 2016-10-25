/**
 * Declares the main angular module for Git-Punch
 */

"use strict";

var angular = require("angular");

require("angular-ui-router");
require("angular-animate");

require("./menu/menu.module");
require("./stats/stats.module");
require("./home/home.module");


var githubStatsApp = angular.module("gstats", [
    // third party modules
    "ngAnimate",
    "ui.router",

    // local modules
    "templates",
    "gstats.menu",
    "gstats.stats",
    "gstats.home"
]);


githubStatsApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("", "/");
    $urlRouterProvider.otherwise("/");
});
