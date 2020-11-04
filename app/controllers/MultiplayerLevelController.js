'use strict';

app.controller('MultiplayerLevelController', function ($scope, sharedGlobals) {
    $scope.difficulty = ["Facil","Medio","Dificil"];


    // Decide si el jugador ha desbloquado los niveles
    // Necesarios para poder jugar multijugador.
    $scope.startMultiplayerGame = function(value){

      var multiplayerUnlokedDifficulties = sharedGlobals.getUlockedDifficulties();

      if (multiplayerUnlokedDifficulties < 3 && value == 'Dificil') {
        var mensaje = "Necesitas completar todos los niveles medios del Modo Solitario para \n"
            mensaje =  mensaje + "poder jugar en modo Dificil."
        sendAlert(mensaje);
      } else if (multiplayerUnlokedDifficulties < 2 && value == 'Medio') {
        var mensaje = "Necesitas completar todos los niveles intermedios del Modo Solitario para \n"
            mensaje =  mensaje + "poder jugar en modo Medio."
        sendAlert(mensaje);
      } else {
        sharedGlobals.setDifficulty(value);
        $scope.changePage('multiplayer');
      }
    };

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


});
