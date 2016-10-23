var angular = require("angular");


function getTitle(commits, repositories, users) {
    return {
        text: 'Commit Statistics on ' + commits + " commits accross " + repositories + " repositories by " + users + " users."
    }
}


angular.module('gstats.home').controller('gstats.home.controller', ["$scope", "$http", "$controller", "gstats.home.service", function PunchcardController($scope, $http, $controller, $punchcard) {
    angular.extend(this, $controller('gstats.punchcard.controller', {$scope: $scope}));

    var users = 0;
    var repositories = 0;

    $scope.personalShown = false;

    $scope.otherSeries.languages = {};
    $scope.personnalSerie = $scope.createSerie("Personal", "#333");

    $scope.addCommit = function(serie, commit) {
        serie.data[commit.hour * 7 + commit.day][2] += commit.count;
        serie.commits += commit.count;
    };

    $scope.highlight = function() {
        if ($scope.personalShown) {
            $scope.findAndRemove($scope.chartConfig.series, $scope.personnalSerie);
        } else {
            $scope.chartConfig.series.push($scope.personnalSerie);
        }
        $scope.personalShown = !$scope.personalShown;
    };


    $punchcard.commits.then(function(commits) {
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

    $punchcard.userCommits.then(function(commits) {
        return commits.map(function(commit) {
            $scope.addCommit($scope.personnalSerie, commit);
        })
    });

    $punchcard.users.then(function(count) {
        users = count;
        $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
    });

    $punchcard.repositories.then(function(count) {
        repositories = count;
        $scope.chartConfig.title = getTitle($scope.globalSerie.commits, repositories, users);
    })

}]);
