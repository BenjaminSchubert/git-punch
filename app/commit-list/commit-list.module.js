"use strict";

var angular = require("angular");


/**
 * This module allows to display information about a list of Highcharts Series
 */
angular.module("gstats.commit-list", []);

require("./commit-list.controller");
require("./commit-list.filters");
require("./commit-list.component");
