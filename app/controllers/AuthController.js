'use strict';

app.controller('AuthController', function($scope) {
    $scope.errorMessage = "";

    // This function is used to login the user
    $scope.loginUser = function (id, password) {
        if(!id || !password)
            return;

        DBloginUser(id, password, function(err, response){
            if (err) {
                console.log(err);
                if (err == 401)
                    $scope.errorMessage = "Contraseña incorrecta";
                else if (err == 404)
                    $scope.errorMessage = "Usuario no encontrado";
                else
                    $scope.errorMessage = err;
                $scope.showErrorMessage();
                $scope.$apply();
                return;
            }

            $scope.changeUser(response);
            $scope.changePage('profile');
            $scope.$apply();
        });
    }

    // This function is used to register the user
    $scope.registerUser = function (id, password) {
        if(!id || !password)
            return;

        DBregisterUser(id, password, function(err, response){
            if (err) {
                console.log(err);
                if (err == 409)
                    $scope.errorMessage = "El usuario ya existe";
                else if (err == 404)
                    $scope.errorMessage = "Usuario no encontrado";
                else
                    $scope.errorMessage = err;
                $scope.showErrorMessage();
                $scope.$apply();
                return;
            }

            $scope.changeUser(response);
            $scope.changePage('profile');
            $scope.$apply();
        });
    }

    $scope.hideErrorMessage = function () {
        document.getElementById("error").style.display='none';
    }

    $scope.showErrorMessage = function () {
        document.getElementById("error").style.display='block';
    }
});
