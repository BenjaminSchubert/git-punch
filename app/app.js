"use strict";

var angular = require("angular");

require("angular-ui-router");
require("./punchcard/punchcard.module");
require("./about/about.module");


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
