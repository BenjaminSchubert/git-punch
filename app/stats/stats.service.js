require("angular");

var app = angular.module('gstats.stats');


app.factory('gstats.stats.service', function($state, $http) {
    return {
        get projects() {
            return $http.get("api/projects")
                .then(function(response) {
                    if (response.data.retry !== undefined) {
                        return Promise.reject({retry: response.data.retry, projects: response.data.projects});
                    }
                    return response.data.projects;
                });
        },

        get commits() {
            return this.projects
                .catch(function(error) {
                    return error.projects
                })
                .then(function(projects) {
                    return projects.map(function(project) {
                        return $http.get("api/commits/" + project.full_name).then(function(commits) {
                            return {commits: commits.data, name: project.name, full_name: project.full_name, color: project.color}
                        });
                    });
                })
                .catch(function() {
                    // FIXME : a better handling would be... better
                    window.location.href = "/auth/login";
                    return [];
                });
        }

    }
});
