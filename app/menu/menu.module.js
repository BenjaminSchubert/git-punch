"use strict";

var angular = require("angular");

require("../auth/auth.module");


angular.module("gstats.menu", ["gstats.auth"]);

require("./menu.controller");
require("./menu.component");
