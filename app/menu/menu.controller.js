var angular = require("angular");


angular.module('gstats.menu').controller('gstats.menu.controller', ["$scope", "gstats.auth.service", function PunchcardController($scope, $auth) {
    $scope.loggedIn = false;

    $auth.loggedIn.then(function(loggedIn) {
        $scope.loggedIn = loggedIn;
    });

    $auth.user.then(function(username) {
        $scope.username = username;
    })
}]);
