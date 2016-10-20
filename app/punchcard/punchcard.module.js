"use strict";

var angular = require("angular");

global.Highcharts = require("highcharts");
require("highcharts-more")(Highcharts);
require("highcharts-ng");

require("../commit-list/commit-list.module");


angular.module("gstats.punchcard", ["highcharts-ng", "gstats.commit-list"]);

require("./punchcard.controller");
