'use strict';

app.controller('PageController', function($scope) {
    $scope.page = 'landing';
    $scope.user = {};
    $scope.level = {};

    $scope.changePage = function (page) {
        //console.log(page);
        $scope.page = page;
        //$scope.$apply();
    }

    $scope.changeUser = function (user) {
        console.log(user);
        $scope.user = user;
        //$scope.$apply();

        var width_window = $(window).width();
        console.log(width_window);
    }

    $scope.startGame = function (level) {
        if (level.isUnlocked) {
            $scope.level = level;
            $scope.changePage('game');
        }
    }

    $scope.logOut = function() {
        $scope.page = 'auth';
        $scope.user = {};
        //$scope.$apply();
    }
});
