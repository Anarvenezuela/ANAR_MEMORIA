'use strict';

app.controller('HighscoresController', function ($scope) {
    DBGetHighscores(function (err, response) {
        if (err)
            return;
      
        if (response.rows.length <= 25) {
            $scope.users = response.rows;
        }
        else {
            $scope.users = response.rows.slice(0,25);
        }
        $scope.$apply();
    });
});
