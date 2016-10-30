"use strict";

require("../punchcard/punchcard.module");


/**
 * Declaration of the stats module for the stats page
 */
require("angular").module("gstats.stats", ["gstats.punchcard"])
    .config(function ($stateProvider) {
        $stateProvider.state({
            name: 'stats',
            url: '/stats',
            component: "gstats.stats.component"
        });
    });


require("./stats.service");
require("./stats.controller");
require("./stats.component");
