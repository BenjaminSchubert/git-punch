"use strict";

/**
 * Declaration of the controller for the menu module
 */
require("angular").module('gstats.menu').controller('gstats.menu.controller', ["$scope", "gstats.auth.service", function($scope, $auth) {
    $scope.loggedIn = false;

    $auth.loggedIn
        .then(function(loggedIn) {
            $scope.loggedIn = loggedIn;
        });

    $auth.user
        .then(function(username) {
            $scope.username = username;
        })
}]);
