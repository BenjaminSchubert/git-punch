require("angular");

var app = angular.module('gstats.stats');


app.factory('gstats.stats.service', function($state, $http) {
    return {
        get repositories() {
            return $http.get("api/private/repositories")
                .then(function(response) {
                    if (response.data.retry !== undefined) {
                        return Promise.reject({retry: response.data.retry, repositories: response.data.repositories});
                    }
                    return response.data;
                })
                .catch(function() {
                    // FIXME : a better handling would be... better
                    window.location.href = "/auth/login";
                    return [];
                });
        }
    }
});
