var angular = require("angular");


function findAndRemove(series, info) {
    series.splice(
        series.findIndex(function(element) {
            return element.category == info.category && element.title == info.title;
        }),
        1
    );
}


function setupSerie() {
    var array = [];
    for (var i=0; i < 24; i++) {
        for (var j=0; j < 7; j++) {
            array.push([i, j, 0]);
        }
    }

    return array;
}


angular.module('gstats.punchcard').controller(
    'gstats.punchcard.controller', ["$scope", function PunchcardController($scope) {
        $scope.selected = null;

        $scope.setupSerie = setupSerie;
        $scope.findAndRemove = findAndRemove;

        $scope.createSerie = function(category, color, title, url) {
            return {
                category: category,
                color: color,
                commits: 0,
                data: $scope.setupSerie(),
                title: title,
                url: url
            }
        };

        $scope.getTitle = function() {
            return { text: "Commit statistics" };
        };

        $scope.addCommit = function(serie, commit) {
            serie.data[commit.hour * 7 + commit.day][2] += 1;
            serie.commits += 1;
        };

        $scope.globalSerie = $scope.createSerie("global", "#888");
        $scope.otherSeries = {};

        $scope.reset = function() {
            if ($scope.selected == null) {
                return;
            }

            $scope.$broadcast("reset-selection");
            $scope.findAndRemove($scope.chartConfig.series, $scope.selected);
            $scope.selected = null;
        };

        $scope.$on("hover", function(event, data) {
           $scope.chartConfig.series.push($scope.otherSeries[data.category][data.title]);
        });

        $scope.$on("blur", function(event, data) {
            $scope.findAndRemove($scope.chartConfig.series, data);
        });

        $scope.$on("select", function(event, data) {
            if ($scope.selected !== null) {
                $scope.findAndRemove($scope.chartConfig.series, $scope.selected);
                $scope.selected = null;
            }
            $scope.selected = data;
            $scope.chartConfig.series.push($scope.otherSeries[data.category][data.title]);
            $scope.$broadcast("reset-selection");
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
            title: $scope.getTitle(),

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

            series: [$scope.globalSerie]

        }
    }]);
