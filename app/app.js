(function() {
    "use strict";

    var angular = require('angular');

    require("./about/about.module");

    require("angular-ui-router");

    var githubStatsApp = angular.module('gstats', ['ui.router', "templates", "gstats.about"]);

    githubStatsApp.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');
    });

})();
