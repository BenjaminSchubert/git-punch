require("angular");

var app = angular.module('gstats.stats');


app.factory('gstats.stats.service', function($state, $http) {
    return {
        get repositories() {
            return $http.get("api/private/repositories")
                .then(function(response) {
                    if (response.data.limitedUntil !== undefined) {
                        return Promise.reject({ limitedUntil: response.data.limitedUntil, data: response.data });
                    }
                    return response.data;
                });
        }
    }
});
