require("angular");

var app = angular.module('gstats.stats');


app.factory('gstats.stats.service', function($state, $http) {
    return {
        get projects() {
            return $http.get("api/private/projects")
                .then(function(response) {
                    if (response.data.retry !== undefined) {
                        return Promise.reject({retry: response.data.retry, projects: response.data.projects});
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
