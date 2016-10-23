var angular = require("angular");


function getTitle(commits, projects) {
    return {
        text: 'Commit Statistics from ' + commits + " commits accross " + projects + " projects."
    }
}


angular.module('gstats.stats').controller('gstats.stats.controller', ["$scope", "$http", "$controller", "gstats.stats.service", function PunchcardController($scope, $http, $controller, $service) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var totalCommits = 0;
    var totalRepositories = 1;

    $scope.otherSeries.projects = {};
    $scope.otherSeries.languages = {};

    $service.projects.then(function(stats) {
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
                console.log(repository);
                name = repository.full_name;
            } else {
                name = repository.name;
            }

            $scope.otherSeries.projects[repository._id] = $scope.createSerie("projects", repository.color, repository._id, name, "https://github.com" + repository.full_name);
        });

        stats.commits.map(function(commit) {
            commit.languages.map(function(language) {
                 if ($scope.otherSeries.languages[language] === undefined) {
                    $scope.otherSeries.languages[language] = $scope.createSerie("languages", "#333", language, language);
                }
                $scope.addCommit($scope.otherSeries.languages[language], commit);
            });

            commit.projects.map(function(project) {
                $scope.addCommit($scope.otherSeries.projects[project], commit);
            });

            $scope.globalSerie.data[commit.hour * 7 + commit.day][2] += 1;
        });

        $scope.chartConfig.title = getTitle(totalCommits, totalRepositories);


    }).then(function() {
        return $http.get("/api/colors", {params: { language: Object.keys($scope.otherSeries.languages) }});
    }).then(function(request) {
        Object.keys(request.data).map(function(language) {
            $scope.otherSeries.languages[language].color = request.data[language];
        })
    });

}]);
