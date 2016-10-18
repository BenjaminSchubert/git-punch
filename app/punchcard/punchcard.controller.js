var angular = require("angular");

function setupSerie() {
    var array = [];
    for (var i=0; i < 24; i++) {
        for (var j=0; j < 7; j++) {
            array.push([i, j, 0]);
        }
    }

    return array;
}

function getTitle(commits, projects) {
    return {
        text: 'Commit Statistics on ' + commits + " commits on " + projects + " projects."
    }
}

angular.module('gstats.punchcard').controller('gstats.punchcard.controller', ["$scope", "gstats.punchcard", function PunchcardController($scope, $punchcard) {
    $scope.totalCommits = 0;
    $scope.totalProjects = 1;
    $scope.projectFetched = 0;

    $scope.series = {
        global: {data: setupSerie(), color: "grey"},
        languages: {},
        projects: {}
    };


    $punchcard.commits.then(function(promises) {
        $scope.totalProjects = promises.length;

        promises.map(function(promise) {
            promise.then(function(commits) {
                $scope.projectFetched += 1;

                commits.map(function(commit) {
                    $scope.series.global.data[commit.hour * 7 + commit.day][2] += 1;

                    commit.languages.map(function(language) {
                        if ($scope.series.languages[language] === undefined) {
                            $scope.series.languages[language] = { data: setupSerie(), color: "red", commits: 0 };
                        }
                        $scope.series.languages[language].data[commit.hour * 7 + commit.day][2] += 1;
                        $scope.series.languages[language].commits += 1;
                    });

                    if ($scope.series.projects[commit.project] === undefined) {
                        $scope.series.projects[commit.project] = { data: setupSerie(), color: "red", commits: 0};
                    }
                    $scope.series.projects[commit.project].commits += 1;

                });
                $scope.totalCommits += commits.length;
                $scope.chartConfig.title = getTitle($scope.totalCommits, $scope.totalProjects);
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
        title: getTitle(0, 0),

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

        series: [$scope.series.global]

    }
}]);
