var angular = require("angular");


angular.module('gstats.commit-list').controller('gstats.commitListController', ["$scope", function commitListController($scope) {
    $scope.totalCommits = 0;
    $scope.totalProjects = 1;
    $scope.projectFetched = 0;
}]);
