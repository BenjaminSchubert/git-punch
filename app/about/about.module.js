"use strict";

var angular = require("angular");

angular.module("gstats.about", []).config(function ($stateProvider) {
    $stateProvider.state('about', {
        url: '/about',
        templateUrl: 'about/about.html'
    });
});
