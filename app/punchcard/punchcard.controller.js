require("angular");

function xAxis() {
    var hours = ["12 am"];

    for (var i=1; i < 12; i++) {
        hours.push(i + " am");
    }

    hours.push(["12 pm"]);

    for (var j=1; j < 12; j++) {
        hours.push(j + " pm");
    }

    return hours;
}


var app = angular.module('gstats.punchcard');

app.controller('gstats.punchcardController', ["$scope", "gstats.punchcard", function PunchcardController($scope, $punchcard) {
    $scope.points = { data: [] };

    $punchcard.commits.then(function(promises) {
        promises.map(function(promise) {
            promise.then(function(commits) {
                commits.map(function(commit) {
                    var point = $scope.points.data.find(function(p) {
                        return commit.hour == p[0] && commit.day == p[1];
                    });

                    if (point !== undefined) {
                        point[2] += 1;
                    } else {
                        $scope.points.data.push([commit.hour, commit.day, 1]);
                    }
                });
                console.log($scope.points);
            });
        })
    });

    $scope.chartConfig = {
        options: {
            chart: {
                defaultSeriesType: 'scatter'
            }
        },
        title: {
            text: 'Commit Statistics'
        },

        xAxis: {
            categories: xAxis()
        },

        yAxis: {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', "Sunday"].reverse()
        },

        series: [$scope.points]

    }
}]);
