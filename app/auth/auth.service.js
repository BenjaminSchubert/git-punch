"use strict";

var app = require("angular").module('gstats.auth');


/**
 * Service to handle authentication
 */
app.factory('gstats.auth.service', function($state, $http) {
    return {
        /**
         * Get user's name
         */
        get user() {
            return $http.get("api/private/user")
                .then(function(user) {
                    return user.data.name;
                });
        },

        /**
         * Get whether the user is logged in or not
         *
         * @returns {boolean|Promise}
         */
        get loggedIn() {
            return this.user
                .then(function() {
                    return true;
                })
                .catch(function(err) {
                    if (err.status === 401) {
                        return false;
                    } else if (err.status === 403) {
                        return true;
                    }
                    return Promise.reject(err);
                });
        }

    }
});
