"use strict";

var angular = require("angular");

require("../punchcard/punchcard.module");


/**
 * Declaration of the homepage module
 */
angular.module("gstats.home", ["gstats.punchcard"])
    .config(function ($stateProvider) {
        $stateProvider.state({
            name: 'home',
            url: '/',
            component: "gstats.home.component"
        });
    });


require("./home.service");
require("./home.controller");
require("./home.component");
