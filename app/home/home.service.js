require("angular");

var app = angular.module('gstats.home');


app.factory('gstats.home.service', function($state, $http) {
    return {
        get commits() {
            return $http.get("api/commits")
                .then(function(commits) {
                    return commits.data;
                });
        }

    }
});
