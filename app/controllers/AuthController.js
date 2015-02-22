'use strict';

app.controller('AuthController', function($scope) {
    // This function is used to login the user
    $scope.loginUser = function (id, password) {
        var resultCode = DBloginUser(id, password, function(err, response){
            if (err)
               return console.log(err); 

            $scope.changeUser(response);
            $scope.changePage('home');  
        });
    }

    // This function is used to register the user
    $scope.registerUser = function (id, password) {
        DBregisterUser(id, password, function(err, response){
            if (err)
               return console.log(err); 

            $scope.changeUser(response);
            $scope.changePage('home');
        });
    }
});