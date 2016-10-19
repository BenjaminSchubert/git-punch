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


function findAndRemove(series, info) {
    series.splice(
        series.findIndex(function(element) {
            return element.category == info.category && element.title == info.title;
        }),
        1
    );
}

angular.module('gstats.punchcard').controller('gstats.punchcard.controller', ["$scope", "$http", "gstats.punchcard", function PunchcardController($scope, $http, $punchcard) {
    $scope.totalCommits = 0;
    $scope.totalProjects = 1;
    $scope.projectFetched = 0;
    $scope.selected = null;

    $scope.reset = function() {
        if ($scope.selected == null) {
            return;
        }

        $scope.$broadcast("reset-selection");
        findAndRemove($scope.chartConfig.series, $scope.selected);
        $scope.selected = null;
    };

    $scope.$on("hover", function(event, data) {
       $scope.chartConfig.series.push($scope.series[data.category][data.title]);
    });

    $scope.$on("blur", function(event, data) {
        findAndRemove($scope.chartConfig.series, data);
    });

    $scope.$on("select", function(event, data) {
        if ($scope.selected !== null) {
            findAndRemove($scope.chartConfig.series, $scope.selected);
            $scope.selected = null;
        }
        $scope.selected = data;
        $scope.chartConfig.series.push($scope.series[data.category][data.title]);
        $scope.$broadcast("reset-selection");
    });

    $scope.series = {
        global: {data: setupSerie(), color: "#888"},
        languages: {},
        projects: {}
    };


    $punchcard.projects.then(function(projects) {
        $scope.totalProjects = projects.length;

        return Promise.all(projects.map(function(promise) {
            return promise.then(function(project) {
                $scope.projectFetched += 1;

                project.commits.map(function(commit) {
                    $scope.series.global.data[commit.hour * 7 + commit.day][2] += 1;

                    commit.languages.map(function(language) {
                        if ($scope.series.languages[language] === undefined) {
                            $scope.series.languages[language] = { data: setupSerie(), color: "#333", commits: 0, title: language, category: "languages" };
                        }
                        $scope.series.languages[language].data[commit.hour * 7 + commit.day][2] += 1;
                        $scope.series.languages[language].commits += 1;
                    });

                    if ($scope.series.projects[project.name] === undefined) {
                        $scope.series.projects[project.name] = {
                            data: setupSerie(), color: project.color, commits: 0, title: project.name, category: "projects", url: "https://github.com/" + project.fullName};
                    }
                    $scope.series.projects[project.name].data[commit.hour * 7 + commit.day][2] += 1;
                    $scope.series.projects[project.name].commits += 1;

                });
                $scope.totalCommits += project.commits.length;
                $scope.chartConfig.title = getTitle($scope.totalCommits, $scope.totalProjects);
            });
        }))
    }).then(function() {
        return $http.get("/api/colors", {params: { language: Object.keys($scope.series.languages) }});
    }).then(function(request) {
        Object.keys(request.data).map(function(language) {
            $scope.series.languages[language].color = request.data[language];
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
                },
                series: {
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
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
            title: {
                text: null
            },
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
