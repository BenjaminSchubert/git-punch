"use strict";

/**
 * Find the given information in the list of series and remove it
 *
 * @param series list of series from which to remove
 * @param info of what to remove
 */
function findAndRemove(series, info) {
    series.splice(
        series.findIndex(function(element) {
            return element.category == info.category && element.id == info.id;
        }),
        1
    );
}


/**
 * Creates a new array of data for the serie
 *
 * @returns {Array}
 */
function setupSerie() {
    var array = [];
    for (var i=0; i < 24; i++) {
        for (var j=0; j < 7; j++) {
            array.push([i, j, 0]);
        }
    }

    return array;
}


/**
 * Controller for the punchcard module
 */
require("angular").module("gstats.punchcard").controller(
    "gstats.punchcard.controller", ["$scope", function($scope) {
        // the currently selected serie
        $scope.selected = null;

        // time to wait before being unlocked by the GitHub API
        $scope.retryIn = undefined;

        $scope.setupSerie = setupSerie;
        $scope.findAndRemove = findAndRemove;

        /**
         * Create a new serie
         *
         * @param category in which the serie is to be put
         * @param color of the data
         * @param id of the serie
         * @param title of the serie
         * @param url to which to go when clicking on the serie
         * @returns {{category: *, color: *, commits: number, data: *, id: *, title: *, url: *}}
         */
        $scope.createSerie = function(category, color, id, title, url) {
            return {
                category: category,
                color: color,
                commits: 0,
                data: $scope.setupSerie(),
                id: id,
                title: title,
                url: url
            }
        };

        /**
         * get the title of the chart
         *
         * @returns {{text: string}}
         */
        $scope.getTitle = function() {
            return { text: "Commit statistics" };
        };

        /**
         * Add a commit to the given serie
         *
         * @param serie to which to add the commit
         * @param commit to add
         */
        $scope.addCommit = function(serie, commit) {
            serie.data[commit.hour * 7 + commit.day][2] += 1;
            serie.commits += 1;
        };

        $scope.globalSerie = $scope.createSerie("global", "#888");
        $scope.otherSeries = {};

        /**
         * reset the selection of the serie to show
         */
        $scope.reset = function() {
            if ($scope.selected == null) {
                return;
            }

            $scope.$broadcast("reset-selection");
            $scope.findAndRemove($scope.chartConfig.series, $scope.selected);
            $scope.selected = null;
        };

        /**
         * Add the serie identified by data to the list of displayed series on hover
         */
        $scope.$on("hover", function(event, data) {
           $scope.chartConfig.series.push($scope.otherSeries[data.category][data.id]);
        });

        /**
         * Remove the serie identified by data from the list of displayed series on blur
         */
        $scope.$on("blur", function(event, data) {
            $scope.findAndRemove($scope.chartConfig.series, data);
        });

        /**
         * Select the serie identified by data to be permanently shown on the scope
         */
        $scope.$on("select", function(event, data) {
            if ($scope.selected !== null) {
                $scope.findAndRemove($scope.chartConfig.series, $scope.selected);
                $scope.selected = null;
            }

            $scope.selected = data;
            $scope.chartConfig.series.push($scope.otherSeries[data.category][data.id]);
            $scope.$broadcast("reset-selection");
        });

        /**
         * Highchart configuration
         *
         * @type {{options: {chart: {type: string, plotBorderWidth: number, zoomType: string}, legend: {enabled: boolean}, plotOptions: {bubble: {minSize: string, maxSize: string}, series: {animation: boolean, states: {hover: {enabled: boolean}}}}, tooltip: {formatter: $scope.chartConfig.options.tooltip.formatter}}, title: *, loading: boolean, xAxis: {minorGridLineDashStyle: string, minorTickInterval: number, minorTickWidth: number, tickInterval: number, labels: {formatter: $scope.chartConfig.xAxis.labels.formatter}}, yAxis: {title: {text: null}, reversed: boolean, startOnTick: boolean, endOnTick: boolean, maxPadding: number, lineWidth: number, categories: string[]}, series: *[]}}
         */
        $scope.chartConfig = {
            options: {
                chart: {
                    type: "bubble",
                    plotBorderWidth: 1,
                    zoomType: "xy"
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    bubble:{
                        minSize:"0%",
                        maxSize:"12%"
                    },
                    series: {
                        animation: false,
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
            loading: true,

            xAxis: {
                minorGridLineDashStyle: "dash",
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
                categories: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },

            series: [$scope.globalSerie]

        }
    }]);
