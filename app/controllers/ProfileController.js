'use strict';

app.controller('ProfileController', function ($scope, $q, sharedGlobals) {
    $scope.category = "";
    $scope.unlockedLevels = [];
    $scope.levelsByCategory = {};
    $scope.array = [0, 1, 2, 3, 4];

    $scope.unlockedCards = [];

    // Mostramos una carta de perfil aleatoria, dentro de las cartas que se
    // han ganado en el juego.
    DBGetUserCards($scope.user, function (err, result) {
      if (err)
          return;

      $scope.profileCardImage = null;

      if ((result.rows.length) == 0) {
        $scope.profileCardImage = 'images/done.png';
        $scope.$apply();
      } else {
        var random = Math.floor(Math.random() * result.rows.length);
        $scope.profileCardImage = result.rows[random].doc.image;
        $scope.$apply();
      };

    })


    $scope.getCategory = function() {

      /* Desbloquea:
       * 1 Nivel Multijugador Facil.
       * 2 Nivel Multijugador Medio.
       * 3 Nivel Multijugador Dificil.
       */

      var unlockedLevels = $scope.user.levels.length;
      if (unlockedLevels < 10){
        $scope.category = "Principiante";
      }
      else if (unlockedLevels >= 10 && unlockedLevels < 25 ) {
        $scope.category = "Investigador";
        sharedGlobals.setUlockedDifficulties(1);
      }
      else if (unlockedLevels >= 25 && unlockedLevels < 45 ) {
        $scope.category = "Aventurero";
        sharedGlobals.setUlockedDifficulties(2);
      }
      else {
        $scope.category = "Arqueólogo";
        sharedGlobals.setUlockedDifficulties(3);
      }
    }

    $scope.getCategory();

    // $scope.verifyMultiplayerActive = function() {
    //   var nivelMultiplayerDesbloq = sharedGlobals.getUlockedDifficulties();
    //
    //   if (nivelMultiplayerDesbloq > 0){
    //     $scope.changePage('multiplayer-level');
    //   } else {
    //     var mensaje = "Necesitas completar todos los niveles fáciles del Modo Solitario para \n"
    //         mensaje =  mensaje + "desbloquear el modo Multijugador."
    //     sendAlert(mensaje);
    //   }
    // };

    // Alertas al jugador
    $scope.textAlert = "";
    $scope.showAlert = false;

    var sendAlert = function(mensaje){
      document.getElementById("alerts").className = "modal fade in";
      document.getElementById("alerts").style.display='block';
      $scope.textAlert = mensaje;
      $scope.showAlert = true;
    }

    // switch flag
    $scope.closeAlert = function() {
       document.getElementById("alerts").className = "modal fade";
       document.getElementById("alerts").style.display='none';
       $scope.textAlert = "";
       $scope.showAlert = false;
    };

    $scope.showCard = function() {
        document.getElementById("modal").style.display="block";
    }

    $scope.hideCard = function() {
        document.getElementById("modal").style.display="none";
    }

});
