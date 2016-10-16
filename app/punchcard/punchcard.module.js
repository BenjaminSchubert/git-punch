"use strict";

var angular = require("angular");

require("highcharts-ng");

angular.module("gstats.punchcard", ["highcharts-ng"])
    .component('punchcard', {
    template: "<p>Just testing</p>"})

    .config(function ($stateProvider) {
        $stateProvider.state({
            name: 'punchcard',
            url: '/punchcard',
            component: "punchcard"
        });
    });


require("./punchcard.component");
