var angular = require("angular");


function getTitle(commits, projects) {
    return {
        text: 'Commit Statistics from ' + commits + " commits on " + projects + " projects."
    }
}


angular.module('gstats.home').controller('gstats.home.controller', ["$scope", "$http", "$controller", "gstats.home.service", function PunchcardController($scope, $http, $controller, $punchcard) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    $scope.totalCommits = 0;

    $scope.otherSeries.languages = {};

    $scope.addCommit = function(serie, commit) {
        serie.data[commit._id.hour * 7 + commit._id.day][2] += commit.count;
        serie.commits += commit.count;
    };


    $punchcard.commits.then(function(commits) {
        $scope.totalCommits = commits.length;

        return commits.map(function(commit) {
            var language = commit._id.languages;
            if ($scope.otherSeries.languages[language] === undefined) {
                $scope.otherSeries.languages[language] = $scope.createSerie("languages", "#333", language);
            }
            $scope.addCommit($scope.otherSeries.languages[language], commit);
            $scope.addCommit($scope.globalSerie, commit);
        });
    }).then(function() {
        return $http.get("/api/colors", {params: { language: Object.keys($scope.otherSeries.languages) }});
    }).then(function(request) {
        Object.keys(request.data).map(function(language) {
            $scope.otherSeries.languages[language].color = request.data[language];
        })
    });

}]);
