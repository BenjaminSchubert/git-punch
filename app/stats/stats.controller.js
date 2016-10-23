var angular = require("angular");


function getTitle(commits, repositories) {
    return {
        text: 'Commit Statistics from ' + commits + " commits accross " + repositories + " repositories."
    }
}


angular.module('gstats.stats').controller('gstats.stats.controller', ["$scope", "$http", "$controller", "gstats.stats.service", function PunchcardController($scope, $http, $controller, $service) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var totalCommits = 0;
    var totalRepositories = 1;

    $scope.otherSeries.repositories = {};
    $scope.otherSeries.languages = {};

    $service.repositories.then(function(stats) {
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

            $scope.otherSeries.repositories[repository._id] = $scope.createSerie("repositories", repository.color, repository._id, name, "https://github.com" + repository.full_name);
        });

        stats.commits.map(function(commit) {
            commit.languages.map(function(language) {
                 if ($scope.otherSeries.languages[language] === undefined) {
                    $scope.otherSeries.languages[language] = $scope.createSerie("languages", "#333", language, language);
                }
                $scope.addCommit($scope.otherSeries.languages[language], commit);
            });

            commit.repositories.map(function(repository) {
                $scope.addCommit($scope.otherSeries.repositories[repository], commit);
            });

            $scope.globalSerie.data[commit.hour * 7 + commit.day][2] += 1;
        });

        $scope.chartConfig.title = getTitle(totalCommits, totalRepositories);

        $scope.chartConfig.loading = false;
    }).then(function() {
        return $http.get("/api/colors", {params: { language: Object.keys($scope.otherSeries.languages) }});
    }).then(function(request) {
        Object.keys(request.data).map(function(language) {
            $scope.otherSeries.languages[language].color = request.data[language];
        })
    });

}]);
