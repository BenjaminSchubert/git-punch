var app = require("angular").module('gstats.home');

const PUBLIC_API = "api/public/";
const PRIVATE_API = "api/private/";


/**
 * Service for the home module
 */
app.factory('gstats.home.service', function($state, $http) {
    return {
        /**
         * Get the global statistics
         *
         * @returns {Promise}
         */
        get stats() {
            return $http.get(PUBLIC_API + "commits")
                .then(function(commits) {
                    return commits.data;
                });
        },

        /**
         * Get the number of users
         *
         * @returns {Promise}
         */
        get users() {
            return $http.get(PUBLIC_API + "users")
                .then(function(response) {
                    return response.data.count;
                })
        },

        /**
         * Get the number of repositories
         *
         * @returns {Promise}
         */
        get repositories() {
            return $http.get(PUBLIC_API + "repositories")
                .then(function(response) {
                    return response.data.count;
                })
        },

        /**
         * Get statistics about the user's data
         *
         * @returns {Promise}
         */
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
