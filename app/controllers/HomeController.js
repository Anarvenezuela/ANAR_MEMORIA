'use strict';

app.controller('HomeController', function ($scope) {
    $scope.levels = {};
    $scope.levelsByCategory = {};

    // First we count how many levels per difficulty are
    DBGetLevels(function (err, result) {
        if (err)
            return;

        var easyLevels = 0;
        var mediumLevels = 0;
        var hardLevels = 0;

        for (var i = 0; i < result.rows.length; i++) {
            switch (result.rows[i].doc.difficulty) {
                case 'easy':
                    easyLevels++;
                case 'medium':
                    mediumLevels++;
                case 'hard':
                    hardLevels++;
            }
        }

        $scope.levelsByCategory.easyLevels = easyLevels;
        $scope.levelsByCategory.mediumLevels = mediumLevels;
        $scope.levelsByCategory.hardLevels = hardLevels;
        $scope.$apply();
    });

    // Then we get the user levels
    DBGetUserLevels($scope.user, function (err, result) {
        var levels = [];
        for (var i = 0; i < result.rows.length; i++) {
            levels.push(result.rows[i].doc);
        }

        $scope.levels = levels;
        $scope.$apply();
    });
});

