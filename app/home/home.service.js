require("angular");

var app = angular.module('gstats.home');

const PUBLIC_API = "api/public/";
const PRIVATE_API = "api/private/";


app.factory('gstats.home.service', function($state, $http) {
    return {
        get commits() {
            return $http.get(PUBLIC_API + "commits")
                .then(function(commits) {
                    return commits.data;
                });
        },

        get userCommits() {
            return $http.get(PRIVATE_API + "commits")
                .then(function(commits) {
                    return commits.data;
                })
        },

        get users() {
            return $http.get(PUBLIC_API + "users")
                .then(function(response) {
                    return response.data.count;
                })
        },

        get projects() {
            return $http.get(PUBLIC_API + "projects")
                .then(function(response) {
                    return response.data.count;
                })
        }

    }
});
