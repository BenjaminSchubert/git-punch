require("angular");

var app = angular.module('gstats.punchcard');


app.factory('gstats.punchcard', function($state, $http) {
    return {
        get projects() {
            return $http.get("api/projects")
                .then(function(projects) {
                    return projects.data.map(function(project) {
                        return $http.get("api/commits/" + project.fullName).then(function(commits) {
                            return {commits: commits.data, name: project.name, fullName: project.fullName}
                        });
                    });
                })
                .catch(function() {
                    window.location.href = "/auth/login";
                    return [];
                });
        }

    }
});
