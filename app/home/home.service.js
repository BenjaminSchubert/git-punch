require("angular");

var app = angular.module('gstats.home');

const PUBLIC_API = "api/public/";
const PRIVATE_API = "api/private/";


app.factory('gstats.home.service', function($state, $http) {
    return {
        get stats() {
            return $http.get(PUBLIC_API + "commits")
                .then(function(commits) {
                    return commits.data;
                });
        },

        get users() {
            return $http.get(PUBLIC_API + "users")
                .then(function(response) {
                    return response.data.count;
                })
        },

        get repositories() {
            return $http.get(PUBLIC_API + "repositories")
                .then(function(response) {
                    return response.data.count;
                })
        },

        get userCommits() {
            return $http.get(PRIVATE_API + "commits")
                .then(function(commits) {
                    return commits.data.commits;
                })
                .catch(function(error) {
                    if (error.status === 403) {
                        return Promise.reject({
                            message: error.data.error,
                            limitedUntil: error.data.limitedUntil
                        });
                    }
                    return Promise.reject(error);
                })
        }

    }
});
