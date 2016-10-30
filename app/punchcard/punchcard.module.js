"use strict";

global.Highcharts = require("highcharts");
require("highcharts-more")(Highcharts);
require("highcharts-ng");

require("../commit-list/commit-list.module");


/**
 * Declaration of the punchcard module
 */
require("angular").module("gstats.punchcard", ["highcharts-ng", "gstats.commit-list"]);

require("./punchcard.controller");
