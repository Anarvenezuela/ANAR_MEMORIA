'use strict';

app.controller('PageController', function($scope) {
    $scope.page = 'auth';
    $scope.user = {};

    $scope.changePage = function (page) {
        $scope.page = page;
        $scope.$apply();
    }

    $scope.changeUser = function (user) {
        $scope.user = user;
        $scope.$apply();
    }
});