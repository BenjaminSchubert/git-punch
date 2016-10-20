var angular = require("angular");


function getTitle(commits, projects) {
    return {
        text: 'Commit Statistics from ' + commits + " commits on " + projects + " projects."
    }
}


angular.module('gstats.stats').controller('gstats.stats.controller', ["$scope", "$http", "$controller", "gstats.stats.service", function PunchcardController($scope, $http, $controller, $punchcard) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    $scope.totalCommits = 0;
    $scope.totalProjects = 1;
    $scope.projectFetched = 0;

    $scope.otherSeries.projects = {};
    $scope.otherSeries.languages = {};


    $punchcard.projects.then(function(projects) {
        $scope.totalProjects = projects.length;

        return Promise.all(projects.map(function(promise) {
            return promise.then(function(project) {
                $scope.projectFetched += 1;
                $scope.totalCommits += project.commits.length;

                project.commits.map(function(commit) {
                    commit.languages.map(function(language) {
                        if ($scope.otherSeries.languages[language] === undefined) {
                            $scope.otherSeries.languages[language] = $scope.createSerie("languages", "#333", language);
                        }
                        $scope.addCommit($scope.otherSeries.languages[language], commit);
                    });

                    if ($scope.otherSeries.projects[project.name] === undefined) {
                        $scope.otherSeries.projects[project.name] = $scope.createSerie("projects", project.color, project.name, "https://github.com/" + project.fullName);
                    }
                    $scope.addCommit($scope.otherSeries.projects[project.name], commit);

                    $scope.globalSerie.data[commit.hour * 7 + commit.day][2] += 1;

                });
                $scope.chartConfig.title = getTitle($scope.totalCommits, $scope.totalProjects);
            });
        }))
    }).then(function() {
        return $http.get("/api/colors", {params: { language: Object.keys($scope.otherSeries.languages) }});
    }).then(function(request) {
        Object.keys(request.data).map(function(language) {
            $scope.otherSeries.languages[language].color = request.data[language];
        })
    });

}]);
