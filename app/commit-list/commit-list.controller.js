var angular = require("angular");


angular.module('gstats.commit-list').controller('gstats.commitListController', ["$scope", function commitListController($scope) {
    $scope.select = function(data) {
        $scope.$parent.$emit("select", { title: data.title, category: data.category });
    }

    $scope.unselect = function(data) {
        $scope.$parent.$emit("unselect", { title: data.title, category: data.category });
    }
}]);
