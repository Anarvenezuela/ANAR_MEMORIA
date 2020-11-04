app.controller('GameController', function($scope, $timeout) {
    var selectedCards = {};
    var totalCards;

    $scope.cards = [];
    $scope.array = [0, 1, 2, 3, 4];
    $scope.counter = $scope.level.time;
    $scope.conLupa = $scope.level._id >= 25;
    $scope.zoom = "";

    // Sonidos
    var quitarPar = new Audio("audio/quitarPar.mp3");
    var derrota = new Audio("audio/derrota.mp3");
    var victoria = new Audio("audio/victoria.mp3");
    var comienzo = new Audio("audio/comienzo.mp3");
    comienzo.play();

    // The first thing we do is set up the timer countdown
    onTimeout = function() {
        $scope.counter--;
        if ($scope.counter <= 0) {
            derrota.play();
            document.getElementById("game_screen").style.display='none';
            document.getElementById("loser_screen").style.display='block';
            document.getElementById("obtenidas").style.display='none';
            return;
        }
        mytimeout = $timeout(onTimeout,1000);
    }

    var mytimeout = $timeout(onTimeout,1000);

    stop = function(time) {
        $timeout.cancel(mytimeout);
        if (time > 0) {
          // Espero time segundos para continuar
          mytimeout = $timeout(onTimeout,time);
        };
    }

    // Then we get the cards
    DBGetLevelCards($scope.level, function (err, result) {
        var cards = [];
        totalCards = result.rows.length;
        for (var i = 0; i < result.rows.length; i++) {
            var card = result.rows[i].doc;
            card.imageShown = 'images/done.png';
            card.position = i;
            cards.push(card);
        };

        cards = shuffle(cards);

        $scope.cards = cards;
        $scope.$apply();
    });

    // This functions are used to handle the game cards
    $scope.showCard = function(card) {
        if (!selectedCards.card1)
            selectedCards.card1 = card;
        else if (!selectedCards.card2)
            selectedCards.card2 = card;
        else {
            if (selectedCards.card1._id == selectedCards.card2._id && selectedCards.card1.position != selectedCards.card2.position) {
                $timeout(removeCard(selectedCards.card1),1000);
            } else {
                selectedCards.card1.imageShown = 'images/done.png';
                selectedCards.card2.imageShown = 'images/done.png';
            }
            if ($scope.conLupa) {
                var pos = selectedCards.card1.position.toString();
                document.getElementById(pos).style.display='none';
                pos = selectedCards.card2.position.toString();
                document.getElementById(pos).style.display='none';
            }

            delete selectedCards.card1;
            delete selectedCards.card2;
            return;
        }

        card.imageShown = card.image;
        if ($scope.conLupa) {
            document.getElementById(card.position.toString()).style.display='initial';
        }
    }

    // Hace zoom de una carta
    $scope.hacerZoom = function(card) {
        document.getElementById('invisible').style.display='table';
        $scope.zoom = card.image;
    }

    // Quita el zoom y regresa a la pantalla de juego
    $scope.quitarZoom = function() {
        document.getElementById('invisible').style.display='none';
    }

    // Se encarga de eliminar cartas iguales y manejar el fin de juego
    // cuando el usuario gana
    var removeCard = function(card) {

        if (totalCards > 2 && $scope.counter > 1)
            moveToBottom(card);

        totalCards -= 2;

        if (totalCards == 0) {
            // El timer se detiene y esconde
            stop(0);
            document.getElementById("timer").style.display='none';

            // Se actualiza el puntaje del nivel
            $scope.score = $scope.counter;

            // Se busca una carta aleatoria entre las cartas del nivel para entregar al usuario
            var random = Math.floor(Math.random() * $scope.cards.length);
            $scope.obtainedCard = $scope.cards[random];

            // Se instancia el usuario activo, se le actualiza el highscore, los niveles
            // y se le desbloquea la nueva carta para luego actualizar la base
            var newUser = $scope.user;
            var addCard = true;
            var addLevel = true;
            newUser.highscore += $scope.score;

            for (var i = 0; i < newUser.levels.length; ++i) {
                if (newUser.levels[i] === $scope.level.nextLevel) {
                    addLevel= false;
                }
            }

            // Revisamos si es un fin de línea de niveles
            if (parseInt($scope.level._id) % 5 == 4) {
				addLevel = false;
				if (newUser.hands < Math.floor((parseInt($scope.level._id) + 1) / 5))
					newUser.hands = newUser.hands + 1;
			}

            if (addLevel)
                newUser.levels.push($scope.level.nextLevel);

            for (var i = 0; i < newUser.cards.length; ++i) {
                if (newUser.cards[i] == $scope.obtainedCard._id) {
                    addCard = false;
                }
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
            victoria.play();
            document.getElementById("game_screen").style.display='none';
            document.getElementById("win_screen").style.display='block';
            document.getElementById("obtenidas").style.display='none';
        }
    }

    // Animación del movimiento de las cartas hacia abajo
    var moveToBottom = function (card) {
        stop(2500);
        var old = $("." + card._id);
        var newcard = $("." + card._id).first().clone().appendTo('#obtenidas');
        newcard.css('width', '110px').css('height','110px').css('padding', '0')
               .css('float','left');
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
        quitarPar.play();

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
            });
        });
    }

    // Reinicio del juego luego de perder o con el botón de la esquina
    $scope.restartGame = function() {

        // Reinicio el estado de las cartas
        var card;
        for (var i = 0; i < $scope.cards.length; ++i) {
            card = $scope.cards[i];
            card.imageShown = 'images/done.png';
            document.getElementsByClassName(card._id)[0].style.display='block';
            document.getElementsByClassName(card._id)[1].style.display='block';
            if ($scope.conLupa) {
                pos = card.position.toString();
                document.getElementById(pos).style.display='None';
            }
        }

        // Reinicio las variables internas del controlador
        totalCards = $scope.cards.length;
        selectedCards = {};

        // Reinicio el contador
        stop(0);
        $scope.counter = $scope.level.time;
        mytimeout = $timeout(onTimeout,1000);

        // Me aseguro que las pantallas correctas se esten mostrando
        document.getElementById("game_screen").style.display='block';
        document.getElementById("loser_screen").style.display='none';
        document.getElementById("win_screen").style.display='none';

        // reinicio las cartas obtenidas
        $('#obtenidas').empty();
        document.getElementById("obtenidas").style.display='block';
    }

    // Se cancela el timeout cuando el usuario abandona el nivel
    $scope.$on("$destroy", function (event) {
        stop(0);
    });

});
