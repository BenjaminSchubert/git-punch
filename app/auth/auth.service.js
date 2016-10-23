require("angular");

var app = angular.module('gstats.auth');


app.factory('gstats.auth.service', function($state, $http) {
    return {
        get user() {
            return $http.get("api/private/user")
                .then(function(user) {
                    return user.data.name;
                })
        },

        get loggedIn() {
            return this.user
                .then(function() {
                    return true;
                }).catch(function(err) {
                    if (err.status === 401) {
                        return false;
                    }
                    throw err;
                })
        }

    }
});
