var angular = require("angular");


/**
 * Formats the title for the graph
 *
 * @param commits number of commits
 * @param repositories number of repositories
 * @param users number of users
 * @returns {{text: string}}
 */
function getTitle(commits, repositories, users) {
    return {
        text: 'Commit Statistics on ' + commits + " commits across " + repositories + " repositories by " + users + " users."
    }
}


/**
 * Controller for the home module
 */
angular.module('gstats.home').controller('gstats.home.controller', ["$scope", "$http", "$controller", "gstats.home.service", function PunchcardController($scope, $http, $controller, $service) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var users = 0;
    var repositories = 0;

    $scope.personalShown = false;
    var fixPersonalShown = false;

    $scope.otherSeries.languages = {};
    $scope.personalSerie = $scope.createSerie("Personal", "#333");

    /**
     * Add a commit to the given serie
     *
     * @param serie to which to add a commit
     * @param commit to add
     */
    $scope.addCommit = function(serie, commit) {
        serie.data[commit.hour * 7 + commit.day][2] += commit.count;
        serie.commits += commit.count;
    };

    /**
     * Show the user's own commits on the chart
     */
    $scope.highlight = function() {
        if (!$scope.personalShown) {
            $scope.chartConfig.series.push($scope.personalSerie);
            $scope.personalShown = true;
        }
    };

    /**
     * Hide the user's own commits
     */
    $scope.removeHighlight = function() {
        if ($scope.personalShown && !fixPersonalShown) {
            $scope.findAndRemove($scope.chartConfig.series, $scope.personalSerie);
            $scope.personalShown = false;
        }
    };

    /**
     * permanently show the user's own commits
     */
    $scope.fixHighlight = function() {
        fixPersonalShown = !fixPersonalShown;

        if (fixPersonalShown) {
            $scope.highlight();
        } else {
            $scope.removeHighlight();
        }
    };


    $service.stats
        .then(function(stats) {
            stats.languages.forEach(function(language) {
                $scope.otherSeries.languages[language.language] =
                    $scope.createSerie("languages", language.color || "#333", language.language, language.language);
            });

            stats.commits.forEach(function(commit) {
                commit.languages.map(function(language) {
                    $scope.addCommit($scope.otherSeries.languages[language], commit);
                });
                $scope.addCommit($scope.globalSerie, commit);
            });

            $scope.chartConfig.loading = false;
            $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
        });

    $service.userCommits
        .then(function(commits) {
            commits.forEach(function(commit) {
                $scope.addCommit($scope.personalSerie, commit);
            })
        })
        .catch(function(error) {
            if (error.message !== undefined) {
                $scope.errorMessage = error.message;
                $scope.limitedUntil = error.limitedUntil;
            } else {
                return Promise.reject(error);
            }
        });

    $service.users
        .then(function(count) {
            users = count;
            $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
        });

    $service.repositories
        .then(function(count) {
            repositories = count;
            $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
        })

}]);
