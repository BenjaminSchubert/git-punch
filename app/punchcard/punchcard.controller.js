require("angular");


var app = angular.module('gstats.punchcard');

app.controller('gstats.punchcardController', ["$scope", "gstats.punchcard", function PunchcardController($scope, $punchcard) {
    $scope.points = { data: [], color: "grey" };

    for (var i=0; i < 24; i++) {
        for (var j=0; j < 7; j++) {
            $scope.points.data.push([i, j, 0]);
        }
    }

    $punchcard.commits.then(function(promises) {
        promises.map(function(promise) {
            promise.then(function(commits) {
                commits.map(function(commit) {
                    $scope.points.data[commit.hour * 7 + commit.day][2] += 1;
                });
                console.log($scope.points);
            });
        })
    });

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                zoomType: 'xy'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                bubble:{
                    minSize:'0%',
                    maxSize:'12%'
                }
            },
            tooltip: {
                formatter: function() {
                    var val = this.point.z;
                    return val + " commit" + ((val > 1) ? "s" : "");
                }
            }
        },
        title: {
            text: 'Commit Statistics'
        },

        xAxis: {
            minorGridLineDashStyle: 'dash',
            minorTickInterval: 1,
            minorTickWidth: 0,
            tickInterval: 1,

            labels: {
                formatter: function() {
                    var val = this.value;
                    if (val == 0)
                        return "12a";
                    else if (val == 12)
                        return "12p";
                    else if (val > 12)
                        return (val - 12) + "p";
                    else
                        return val + "a";
                }
            }
        },

        yAxis: {
            reversed: true,
            startOnTick: false,
            endOnTick: false,
            maxPadding: 0.9,
            lineWidth: 0,
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', "Sunday"]
        },

        series: [$scope.points]

    }
}]);
