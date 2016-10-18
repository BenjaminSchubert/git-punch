var angular = require("angular");


angular.module('gstats.commit-list').controller('gstats.commitListController', ["$scope", function commitListController($scope) {
    $scope.selected = null;
    var waitNext = false;

    $scope.$on("reset-selection", function() {
        if ($scope.selected !== null) {
            waitNext = !waitNext;
        }

        if (!waitNext) {
            $scope.selected = null;
        }
    });

    $scope.hover = function(data) {
        $scope.$parent.$emit("hover", { title: data.title, category: data.category });
    };

    $scope.blur = function(data) {
        $scope.$parent.$emit("blur", { title: data.title, category: data.category });
    };

    $scope.select = function(data) {
        if (data === $scope.selected) {
            data = null;
        }
        $scope.selected = data;
        waitNext = false;
        $scope.$parent.$emit("select", {title: data.title, category: data.category});
    }

}]);
