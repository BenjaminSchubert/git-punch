"use strict";

require("../auth/auth.module");


/**
 * Declaration of the menu module
 */
require("angular").module("gstats.menu", ["gstats.auth"]);

require("./menu.controller");
require("./menu.component");
