var angular = require("angular");


function getTitle(commits, repositories, users) {
    return {
        text: 'Commit Statistics on ' + commits + " commits accross " + repositories + " repositories by " + users + " users."
    }
}


angular.module('gstats.home').controller('gstats.home.controller', ["$scope", "$http", "$controller", "gstats.home.service", function PunchcardController($scope, $http, $controller, $service) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var users = 0;
    var repositories = 0;

    $scope.personalShown = false;
    var fixPersonalShown = false;

    $scope.otherSeries.languages = {};
    $scope.personalSerie = $scope.createSerie("Personal", "#333");

    $scope.addCommit = function(serie, commit) {
        serie.data[commit.hour * 7 + commit.day][2] += commit.count;
        serie.commits += commit.count;
    };

    $scope.highlight = function() {
        if (!$scope.personalShown) {
            $scope.chartConfig.series.push($scope.personalSerie);
            $scope.personalShown = true;
        }
    };

    $scope.removeHighlight = function() {
        if ($scope.personalShown && !fixPersonalShown) {
            $scope.findAndRemove($scope.chartConfig.series, $scope.personalSerie);
            $scope.personalShown = false;
        }
    };

    $scope.fixHighlight = function() {
        fixPersonalShown = !fixPersonalShown;

        if (fixPersonalShown) {
            $scope.highlight();
        } else {
            $scope.removeHighlight();
        }
    };


    $service.commits
        .then(function(commits) {
            return commits.map(function(commit) {
                commit.languages.map(function(language) {
                    if ($scope.otherSeries.languages[language] === undefined) {
                        $scope.otherSeries.languages[language] = $scope.createSerie("languages", "#333", language, language);
                    }
                    $scope.addCommit($scope.otherSeries.languages[language], commit);
                });
                $scope.addCommit($scope.globalSerie, commit);
            });
        }).then(function() {
            $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
            $scope.chartConfig.loading = false;
            return $http.get("/api/colors", {params: { language: Object.keys($scope.otherSeries.languages) }});
        }).then(function(request) {
            Object.keys(request.data).map(function(language) {
                $scope.otherSeries.languages[language].color = request.data[language];
            })
        });

    $service.userCommits
        .then(function(commits) {
            return commits.map(function(commit) {
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
