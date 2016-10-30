var angular = require("angular");


/**
 * Controller for the commitList module
 */
angular.module('gstats.commit-list').controller('gstats.commitListController', ["$scope", function commitListController($scope) {
    $scope.selected = null;
    var waitNext = false;

    /**
     * Reset the selected item in the list
     */
    $scope.$on("reset-selection", function() {
        if ($scope.selected !== null) {
            waitNext = !waitNext;
        }

        if (!waitNext) {
            $scope.selected = null;
        }
    });

    /**
     * Event sent on hover
     *
     * @param data the id and category of the entry that is hovered
     */
    $scope.hover = function(data) {
        $scope.$parent.$emit("hover", { id: data.id, category: data.category });
    };

    /**
     * Event sent on blur
     *
     * @param data the id and category of the entry that is blurred
     */
    $scope.blur = function(data) {
        $scope.$parent.$emit("blur", { id: data.id, category: data.category });
    };

    /**
     * Event sent when an item is clicked
     *
     * @param data the id and category of the entry that is clicked
     */
    $scope.select = function(data) {
        if (data === $scope.selected) {
            data = null;
        }
        $scope.selected = data;
        waitNext = false;
        $scope.$parent.$emit("select", { id: data.id, category: data.category });
    }

}]);
