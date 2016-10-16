"use strict";

var angular = require("angular");

require("./modules.config");

var githubStatsApp = angular.module("gstats", [
    // third party modules
    "ui.router",

    // local modules
    "templates",
    "gstats.about",
    "gstats.punchcard"
]);


githubStatsApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("", "/");
    $urlRouterProvider.otherwise("/");
});
