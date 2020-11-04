'use strict';

app.controller('MultiplayerGameController', function($scope, $http, $q, sharedGlobals, $timeout) {

  var score_por_carta = 10;
  $scope.score_por_ganar   = 50;
  $scope.score_por_perder  = 25;
  var totalCards = 10;

  // Direccion del servidor de juego
  var serverURL = 'http://159.90.9.166:444/';

  // Obtenemos la dificultad del juego que escogimos anteriormente.
  var dificultad = sharedGlobals.getDifficulty();
  $scope.gameDifficulty = dificultad;
  $scope.counter   = 100;  // Se establece el timer para el jugador.
  var temporizador = 0;

  // Sonidos del Juego
  var sonidoQuitar   = new Audio("audio/quitarPar.mp3");
  var sonidoDerrota  = new Audio("audio/derrota.mp3");
  var sonidoVictoria = new Audio("audio/victoria.mp3");
  var sonidoComienzo = new Audio("audio/comienzo.mp3");

  // Para Manejar las jugadas
  $scope.jugada = "";
  $scope.all_gameplays = [];

  // Para actualizar los jugadores.
  $scope.mynumber = 0;           // Me deja saber si soy el jugador 1 o el 2.
  $scope.mydata   = {};          // Almacena mis datos (username, id y score) manejados del servidor.
  $scope.other_player_data = {}; // Almacena los datos de mi contrincante.

  // Guarda los datos del juego
  $scope.gamedata = {};          // Almacena los datos del juego en el que estoy unido

  // Token. Si tengo el token, es mi turno de jugar.
  $scope.token = false;

  $scope.winner = false; // Indica si acabo de ganar el juego o no.


  // Se establece el contador.
  function onTimeout() {
      $scope.counter--;
      if ($scope.counter <= 0) {
        showTimeout();
      } else {
          temporizador = $timeout(onTimeout,1000);
      }
  }

  function stopTimer(time){
      $timeout.cancel(temporizador);
      if (time > 0) {
        // Espero time segundos para continuar
        temporizador = $timeout(onTimeout,time);
      };
  }


  // ------------------- PARA LA CONEXION CON EL SERVIDOR ----------------------
  // Permite el correcto funcionaiento de la parte multijugador
  // ---------------------------------------------------------------------------
  var connectSocket = function(){

      //Creating connection with server
      var socket = io.connect(serverURL);

      // Definimos todas las llamadas que el socket espera a escuchar desde
      // el servidor de juegos.
      socket.on('connect', function () {

        // Cuando el jugador_2 se une al juego, comienza este.
        socket.on('start_game',function(){

          updateGameData().then(function() {
              $scope.cards = $scope.gamedata.game_set;
              updatePlayers();
              showGameView();
              sonidoComienzo.play();
              temporizador = $timeout(onTimeout,1000);
          }, function(reason) {
          });
        });

        // cuando suba el puntaje, actualizamos los jugadores.
        socket.on('update_scores',function(){
          updatePlayers();
        });

        // Cuando el contrincante abanona la partida
        socket.on("player_logout",function(username){
            showPlayerLogout();
            stopTimer(0);
        });

        // Cuando me toque voltear una carta
        socket.on("show_card",function(position){
            flipCard(position);
        });

      });
    return socket;
  };

  // Nos conectamos al servidor via socket. serverConnection contiene el socket a usar.
  var serverConnection = connectSocket();

  // ---------------------------------------------------------------------------
  // ------------------- PARA LA SELECCIÓN DE LAS CARTAS. ----------------------

  var idFinal; // Indicará el id de la última carta.

  // Se selecciona el id de la última carta dependiendo de la dificultad elegida.
  switch (dificultad) {
    case 'Facil':
      var limListas = [5, 10];
      idFinal = limListas[Math.floor(Math.random() * limListas.length)];
      break;
    case 'Intermedio':
      var limListas = [15, 20, 25];
      idFinal = limListas[Math.floor(Math.random() * limListas.length)];
      break;
    case 'Medio':
      var limListas = [30, 35, 40, 45];
      idFinal = limListas[Math.floor(Math.random() * limListas.length)];
      break;
    case 'Dificil':
      var limListas = [50, 55, 60, 65, 70];
      idFinal = limListas[Math.floor(Math.random() * limListas.length)];
      break;
  }

  // Se crea el nivel a jugar.
  var level = {
      _id: "-1",                  // Se establece el id en -1 ya que no pertenece a ninguno de los niveles en solitario.
      difficulty: dificultad,
      name: 'Nivel Multijugador ' + dificultad, // Nombre inicial de la sala.
      cards: getArray(idFinal - 5, idFinal),    // Id de las cartas a elegir.
      numPieces: 10,                            // Número de piezas que estarán en el tablero.
      time: '100',                              // Tiempo que tendrá cada jugador en la partida.
      imageName: 'done.png',
      nextLevel: "Ninguno"                     // Como es multijugador no habrá ningún nivel desbloqueable.
  };

  $scope.level = level   // "Nivel" que jugará los jugadores.

  // Para el uso de las cartas.
  var selectedCards = {}         // Conjunto con todas las cartas que aparecerán.

  $scope.cards = [];
  $scope.array = [0, 1, 2, 3, 4];

  // Barajea las cartas obtenidas y las coloca en un arreglo listo para poder
  // jugar.
  var sortCards = function () {

    var deferred = $q.defer();

    DBGetLevelCards($scope.level, function (err, result) {
        var cards = [];

        // Se preparan las cartas que se utilizarán.
        for (var i = 0; i < result.rows.length; i++) {
            var card = result.rows[i].doc;
            card.imageShown = 'images/done.png';
            card.position = i;
            cards.push(card);

        };

        // Se barajean las cartas.
        cards = shuffle(cards);

        $scope.game_set = cards;
        $scope.$apply();
        return deferred.resolve();
    });

        return deferred.promise;
  };

  // Permite controlar las cartas.
  $scope.showCard = function(position) {

      // Muestra un mensaje de alerta si no es el turno del jugador.
      if (!$scope.token) {
          sendAlert("¡Aún no es tu turno! Espera a que tu contrincario haga su jugada.");
          return;
      }

      // El jugador solo puede voltear dos cartas.
      if (selectedCards.card2) {
        return;
      }

      // Buscamos la carta en el arreglo de cartas.
      var card = $scope.cards[position];
      card.imageShown = card.image;

      // le informamos al otro jugador que tiene que voltear la carta tambien
      serverConnection.emit("show_card",position, $scope.gamedata.id);

      if (!selectedCards.card1){
          selectedCards.card1 = card;
      } else if (!selectedCards.card2){
          selectedCards.card2 = card;
          if (selectedCards.card1 && selectedCards.card2) {
              // Conteo para voltear las cartas
              $timeout(removeOrHideCard,1000);
          }
      }
      return
  };

  // Voltea la carta, si el otro jugador fue el que la jugo.
  var flipCard = function(position) {

      var card = $scope.cards[position];
      card.imageShown = card.image;
      $scope.$apply();
      if (!selectedCards.card1){
          selectedCards.card1 = card;
      } else if (!selectedCards.card2){
          selectedCards.card2 = card;
          if (selectedCards.card1 && selectedCards.card2) {
              $timeout(removeOrHideCardOpponent,1000);
        }
      }
      return;
  };

  // Remueve o oculta las cartas una vez que hay dos cartas cara arriba y fue el usuario.
  function removeOrHideCard() {
    // $scope.$apply() verifica que hay cambios en la vista.
    $scope.$apply(function(){
      if (selectedCards.card1._id == selectedCards.card2._id && selectedCards.card1.position != selectedCards.card2.position) {
          updateScore(score_por_carta).then(function(){
            removeCard(selectedCards.card1);
            sonidoQuitar.play();
            delete selectedCards.card1;
            delete selectedCards.card2;
          });
      } else {
          selectedCards.card1.imageShown = 'images/done.png';
          selectedCards.card2.imageShown = 'images/done.png';
          delete selectedCards.card1;
          delete selectedCards.card2;
        }
    });

    // Si era mi turno al momento de voltear, las cartas, ya no lo es.
    // y viceversa.
    changeToken();
    return;

  };

  // Remueve o oculta las cartas una vez que hay dos cartas cara arriba y no jugó el usuario.
  function removeOrHideCardOpponent() {
    // $scope.$apply() verifica que hay cambios en la vista.
    $scope.$apply(function(){
      if (selectedCards.card1._id == selectedCards.card2._id && selectedCards.card1.position != selectedCards.card2.position) {
          removeCardOp(selectedCards.card1);
          sonidoQuitar.play();
          delete selectedCards.card1;
          delete selectedCards.card2;
      } else {
          selectedCards.card1.imageShown = 'images/done.png';
          selectedCards.card2.imageShown = 'images/done.png';
          delete selectedCards.card1;
          delete selectedCards.card2;
        }
    });
    // Si era mi turno al momento de voltear, las cartas, ya no lo es.
    // y viceversa.
    changeToken();
    return;

  };


  // Inicia el proceso para remover las cartas del juego
  var removeCard = function(card) {

    if (totalCards >= 2 && $scope.counter > 1)
      // Mueve las cartas al fondo.
      moveToBottom(card).then(function(){
          totalCards -= 2;

          if (totalCards == 0){
              $timeout(finishGame,1000);
            };
      });
  }

  var removeCardOp = function(card) {

      if (totalCards >= 2)
        // Mueve las cartas al fondo.
      moveToBottomRight(card).then(function(){
          totalCards -= 2;

          if (totalCards == 0){
              $timeout(finishGame,1000);
            };
      });

  }

  // Animación del movimiento de las cartas hacia abajo
  var moveToBottom = function (card) {
      stopTimer(2500);
      var deferred = $q.defer();

      var old = $("." + card._id);
      var newcard = $("." + card._id).first().clone().appendTo('#obtenidas');
      newcard.css('width', '110px').css('height','110px').css('padding', '0');
      var newOffset = newcard.offset();
      var oldOffset1 = old.first().offset();
      var oldOffset2 = old.last().offset();
      var temp = old.clone().appendTo('body');
      temp.css('position', 'absolute').css('zIndex', 999)
          .css('top', oldOffset1.top).css('left', oldOffset1.left)
          .css('width', old.first().width())
          .css('height', old.first().height())
          .css('padding', 0);
      temp.last().css('top', oldOffset2.top).css('left',oldOffset2.left);
      old.hide();
      newcard.hide();
      //quitarPar.play();
      // El primer animate es para centrar la carta y el segundo es para
      // posicionarla en la zona de cartas obtenidas.
      temp.animate({
          top: $(document).height()/2.5 - newcard.height() * 2.5,
          left:$(document).width()/2 - newcard.width() * 2,
          width: newcard.width() * 5,
          height: newcard.height() * 5,
      }, 1000, function () {
          temp.animate({
            top: newOffset.top,
            left:newOffset.left,
            width: newcard.width(),
            height: newcard.height(),
          }, 1200, function(){
            newcard.show();
            temp.remove();
            return deferred.resolve();
          });
      });

      return deferred.promise;
  }

  var moveToBottomRight = function (card) {
      stopTimer(2500);
      var deferred = $q.defer();

      var old = $("." + card._id);
      var newcard = $("." + card._id).first().clone().appendTo('#obtenidasOp');
      newcard.css('width', '110px').css('height','110px').css('padding', '0')
             .css('float','right');
      var newOffset = newcard.offset();
      var oldOffset1 = old.first().offset();
      var oldOffset2 = old.last().offset();
      var temp = old.clone().appendTo('body');
      temp.css('position', 'absolute').css('zIndex', 999)
          .css('top', oldOffset1.top).css('left', oldOffset1.left)
          .css('width', old.first().width())
          .css('height', old.first().height())
          .css('padding', 0);
      temp.last().css('top', oldOffset2.top).css('left',oldOffset2.left);
      old.hide();
      newcard.hide();
      //quitarPar.play();

      // El primer animate es para centrar la carta y el segundo es para
      // posicionarla en la zona de cartas obtenidas.
      temp.animate({
          top: $(document).height()/2.5 - newcard.height() * 2.5,
          left:$(document).width()/2 - newcard.width() * 2,
          width: newcard.width() * 5,
          height: newcard.height() * 5,
      }, 1000, function () {
          temp.animate({
            top: newOffset.top,
            left:newOffset.left,
            width: newcard.width(),
            height: newcard.height(),
          }, 1200, function(){
            newcard.show();
            temp.remove();
            return deferred.resolve();
          });
      });

      return deferred.promise;
  }

  // -----------------------------------------------------------------------------

  // ----------------- MANEJO DE LA MECANICA MULTIJUGADOR ------------------------

  // Registra al jugador en el servidor.
  var registerUser = function() {
    var deferred = $q.defer();  // Me permite saber si el usuario se registro satisfactoriamente

    // Se "calcula" la categoria a la que pertenece el jugador.
    var userCategory = "";
    var unlockedLevels = $scope.user.levels.length;

    if (unlockedLevels < 10) userCategory = "Principiante";
    else if (unlockedLevels >= 10 && unlockedLevels < 25 ) userCategory = "Investigador";
    else if (unlockedLevels >= 25 && unlockedLevels < 45 ) userCategory = "Aventurero";
    else userCategory = "Investigador";

    $http.post(serverURL + 'api/players', {
            'username' : $scope.user._id,
            'category' : userCategory,
            'score'    : 0
        })
        .success(function(data){
            $scope.playerID = data.id;
            return deferred.resolve();
        })
        .error(function(data){
            return deferred.reject('No se pudo registrar el usuario');
        });

    return deferred.promise;
    };

    // Para unir a un usuario a un juego.
    var joinGame = function(gameID, playerID, playerNumber) {

      var data = {}
      if (playerNumber == 1) {
          data = {"player1": playerID};
      } else {
          data = {"available":false,"player2": playerID};
      }

      $http.put(serverURL + 'api/Games/'+ gameID, data)
          .success(function(data){
          })
          .error(function(data){
          });
      };

    // Crea un juego nuevo.
    var createGame = function() {
      // Cuando creo un juego nuevo, creo las cartas que se van a jugar.

      var deferred = $q.defer();

      sortCards().then(function() {
        // dificultad, juego_libre, distribucion del tablero (para despues)
        $http.post(serverURL + 'api/Games', {
              'difficulty' : $scope.gameDifficulty,
              'available'  : true,
              'game_set'   : $scope.game_set
        })
        .success(function(data){
            $scope.gamedata = data;
            // Unimos al jugador al nuevo juego creado
            $scope.mynumber = 1;
            joinGame($scope.gamedata.id,$scope.playerID,$scope.mynumber);
            // Como es el primer jugador, le toca el token.
            $scope.token = true;
            return deferred.resolve();
        })
        .error(function(data){
        });
      }, function(reason) {
      });
      return deferred.promise;
    };

    // Busca si hay juegos disponibles en nuestra difucultad,
    // si no hy ninguno, creamos uno nuevo.
    var searchGames = function() {
      $http.get(serverURL + 'api/Games/findOne?filter[where][available]=true' +
                            '&filter[where][difficulty]=' + $scope.gameDifficulty)
      .success(function(data){
          if (data) {
            $scope.gamedata = data;
            $scope.mynumber = 2;
            joinGame($scope.gamedata.id, $scope.playerID, $scope.mynumber);
            serverConnection.emit('players_ready', $scope.gamedata.id);
          } else {
            createGame().then(function(){
              serverConnection.emit("create_game", $scope.gamedata.id);
            }, function(reason) {
            });
          }
      })
      .error(function(data) {
        createGame().then(function(){
          serverConnection.emit("create_game", $scope.gamedata.id);
        }, function(reason) {
        });
      });
    };

    // Actualiza los datos del juego, al momento de iniciar a jugar.
    var updateGameData = function() {
      var deferred = $q.defer();  // Me permite saber si actualizamos los satisfactoriamente
      $http.get(serverURL + 'api/Games/' + $scope.gamedata.id)
        .success(function(data){
            $scope.gamedata = data;
            return deferred.resolve();
        })
        .error(function(data){
            return deferred.reject('No se pudieron actualizar los datos del juego');
        });

        return deferred.promise;
    };

    // Actualiza los datos del jugador actual acorde al servidor.
    var updateMydata = function(id) {
      $http.get(serverURL + 'api/Players/' + id)
        .success(function(data){
            $scope.mydata = data;
        })
        .error(function(data){
        });
    };

    // Actualiza los datos de juego del jugador contrincante.
    var updateOponentData = function(id) {
      $http.get(serverURL + 'api/Players/' + id)
        .success(function(data){
            $scope.other_player_data = data;
        })
        .error(function(data){
        });
    };

    // Actualizamos los datos de ambos jugadores
    var updatePlayers = function() {
      if ($scope.mynumber == 1) {
        updateMydata($scope.gamedata.player1);
        updateOponentData($scope.gamedata.player2);
      } else {
        updateMydata($scope.gamedata.player2);
        updateOponentData($scope.gamedata.player1);
      }
    };

    // Actualizamos el puntaje de juego del jugador actual.
    var updateScore = function(points) {
      var deferred = $q.defer();
      $http.put(serverURL + 'api/Players/'+ $scope.playerID, {'score':$scope.mydata.score+points})
          .success(function(data){
            serverConnection.emit("new_score", $scope.gamedata.id);
            return deferred.resolve();
          })
          .error(function(data){
            return deferred.reject();
          });

      return deferred.promise
    };

    // Muestra la pantalla de ganar/perder y guarda los puntajes respectivos en el servidor de juego.
    var finishGame = function() {
      stopTimer(0);
      var newUser = $scope.user;
      var addCard = false;

      if ($scope.mydata.score > $scope.other_player_data.score) {

        //Escogemos una carta aleatoria entre la cartas del nivel.
        var random = Math.floor(Math.random() * $scope.cards.length);
        $scope.obtainedCard = $scope.cards[random];
        addCard = true;
        newUser.multiplayer_highscore += ($scope.mydata.score + $scope.score_por_ganar);
        showWinScreen();
      } else {
        showLoseScreen();
        newUser.multiplayer_highscore += ($scope.score_por_perder);
      }

      if (addCard)
          newUser.cards.push($scope.obtainedCard._id);

      DBUpdateUser(newUser, function(err, response) {
          if (err)
              console.log(err);
          else {
              $scope.user._rev = response.rev
          }
      });
    }

  // Intercambia el token entre los jugadores
  var changeToken = function() {
    if ($scope.token) {
      $scope.token = false;
    } else {
      $scope.token = true;
    }

  };

  // -----------------------------------------------------------------------------

  // ----------- PARA EL CIERRE DE JUEGO Y DESLOGGEO DEL SERVIDOR ---------------

  // Desloguea a un jugador del servidor de juego.
  var unregiterUser = function(playerID)  {
    $http.delete(serverURL + 'api/Players/' + playerID)
    .success(function(data){
    })
    .error(function(data){
    });
  };

  // Inicia el proceso cuando un jugador decide abandonar la partida.
  $scope.isLeaving = function() {
    document.getElementById("exitModal").className = "modal fade in";
    document.getElementById("exitModal").style.display='block';
  }


  $scope.leaveGame = function() {
    // Sacamos al jugador actual del juego
    unregiterUser($scope.mydata.id);
    // Le informamos al contrincario que el jugador actual ha abandonado la
    // partida
    serverConnection.emit("player_logout",$scope.mydata.username, $scope.gamedata.id);
    // Regresamos al jugador a su perfil
    $scope.closeGame();

  }

  $scope.notLeaveGame = function() {
    document.getElementById("exitModal").className = "modal fade";
    document.getElementById("exitModal").style.display='none';
  }

  // Termina el juego, asigna los puntajes al jugador ganador.
  $scope.closeGame = function() {
    // Abandonamos el juego

    $http.delete(serverURL + 'api/Games/' + $scope.gamedata.id)
    .success(function(data){
      $scope.changePage("profile");
    })
    .error(function(data){
    });
  }

  //----------------------------------------------------------------------------

  // ------------------------ CONTROL DE LAS VISTAS ----------------------------

  // Muestra la pantalla al jugador cuando el contrincante abandona la partida

  var showPlayerLogout = function(){
    document.getElementById("multiplayer_game").style.display='none';
    document.getElementById("player_logout").style.display='block';
  };

  var showTimeout = function(){
    document.getElementById("multiplayer_game").style.display='none';
    document.getElementById("time_up").style.display='block';
  };

  // Muestra la pantalla al jugador cuando el contrincante abandona la partida

  var showGameView = function(){
    document.getElementById("wait_other_player").style.display='none';
    document.getElementById("multiplayer_game").style.display='block';
  };

  var showWinScreen = function(){
    document.getElementById("multiplayer_game").style.display='none';
    document.getElementById("obtenidas").style.display='none';
    document.getElementById("obtenidasOp").style.display='none';
    document.getElementById("win_screen").style.display='block';
  };

  var showLoseScreen = function(){
    document.getElementById("multiplayer_game").style.display='none';
    document.getElementById("obtenidas").style.display='none';
    document.getElementById("obtenidasOp").style.display='none';
    document.getElementById("lose_screen").style.display='block';
  };

  var showEndGame = function() {
      console.log("Se mostrara la pantalla de finalizacion de juego.");
  }

  // Alertas al jugador
  $scope.textAlert = "";
  $scope.showAlert = false;

  var sendAlert = function(mensaje){
    document.getElementById("alerts").className = "modal fade in";
    document.getElementById("alerts").style.display='block';
    $scope.textAlert = mensaje;
    $scope.showAlert = true;
    $timeout($scope.closeAlert,5000);
  }

  // switch flag
  $scope.closeAlert = function() {
     document.getElementById("alerts").className = "modal fade";
     document.getElementById("alerts").style.display='none';
     $scope.textAlert = "";
     $scope.showAlert = false;
  };

  // ---------------------------------------------------------------------------

  // ---------------- INICO DEL JUEGO MULTIJUGADOR -----------------------------

  // Iniciamos el proceso de multijugaor
  // searchGames solo se ejecuta si el usuario se registro en el servidor satisfactoriamente.

  registerUser().then(function() {
      searchGames();
  }, function(reason) {
  });

  // ---------------------------------------------------------------------------

});
