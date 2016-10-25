"use strict";

var angular = require("angular");


/**
 * Formats a title given the number of commits and repositories
 *
 * @param commits number of commits
 * @param repositories number of repositories
 * @returns {{text: string}}
 */
function getTitle(commits, repositories) {
    return {
        text: 'Commit Statistics from ' + commits + " commits accross " + repositories + " repositories."
    }
}


/**
 * Controller for the stats module
 */
angular.module('gstats.stats').controller('gstats.stats.controller', ["$scope", "$http", "$controller", "gstats.stats.service", function PunchcardController($scope, $http, $controller, $service) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var totalCommits = 0;
    var totalRepositories = 1;

    $scope.otherSeries.repositories = {};
    $scope.otherSeries.languages = {};
    $scope.limitedUntil = undefined;

    $service.repositories
        .catch(function(error) {
            if (error.limitedUntil !== undefined) {
                $scope.limitedUntil = error.limitedUntil;
                return error.data;
            }
            return Promise.reject(error);
        })
        .then(function(stats) {
            totalRepositories = stats.repositories.length;
            totalCommits = stats.commits.length;

            var duplicateNames = stats.repositories
                .filter(function(repository, index) {
                    return stats.repositories.findIndex(function (repo) {
                        return repo.name === repository.name;
                    }) !== index;
                })
                .map(function(repo) {
                    return repo.name;
                });

            stats.repositories.map(function(repository) {
                var name;
                if (duplicateNames.find(function(repo) { return repo === repository.name; })) {
                    name = repository.full_name;
                } else {
                    name = repository.name;
                }

                $scope.otherSeries.repositories[repository.id] = $scope.createSerie("repositories", repository.color, repository.id, name, "https://github.com/" + repository.full_name);
            });

            stats.languages.forEach(function(language) {
                $scope.otherSeries.languages[language.language] =
                    $scope.createSerie("languages", language.color || "#333", language.language, language.language);
            });

            stats.commits.map(function(commit) {
                commit.languages.map(function(language) {
                    $scope.addCommit($scope.otherSeries.languages[language], commit);
                });

                commit.repositories.map(function(repository) {
                    $scope.addCommit($scope.otherSeries.repositories[repository], commit);
                });

                $scope.globalSerie.data[commit.hour * 7 + commit.day][2] += 1;
            });

            $scope.chartConfig.title = getTitle(totalCommits, totalRepositories);

            $scope.chartConfig.loading = false;
        })
        .catch(function(error) {
            if (error.status === 401) {
                window.location.href = "/auth/login";
            } else {
                Promise.reject(error);
            }
        });

}]);
