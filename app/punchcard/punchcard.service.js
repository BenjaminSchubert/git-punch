require("angular");

var app = angular.module('gstats.punchcard');


app.factory('gstats.punchcard', function($http) {
    return {
        get projects() {
            return $http.get("api/punchcard/projects").then(function(result) {
                return result.data;
            })
        },

        get commits() {
            return this.projects.then(function(result) {
                count = 0;
                return result.map(function(res) {
                    var promise = new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(function() {
                                return $http.get("api/punchcard/commits/" + res).then(function (data) {
                                    return data.data;
                                })
                            });
                        });
                    });
                    count += 250;

                    return promise;

                });
            })
        }
    };

});
