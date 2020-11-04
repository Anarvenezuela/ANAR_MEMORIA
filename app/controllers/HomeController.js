'use strict';

app.controller('HomeController', ['$scope','DatosCuriosos', '$sce',
function ($scope, DatosCuriosos, $sce) {
    $scope.levels = {};
    $scope.unlockedLevels = [];
    $scope.levelsByCategory = {};
    $scope.array = [0, 1, 2, 3, 4];
	$scope.datoCurioso = "";

    /*
     * The first thing the controller will do is get the user levels
     */
    DBGetUserLevels($scope.user, function (err, result) {
        var levels = [];
        for (var i = 0; i < result.rows.length; i++) {
            levels.push(result.rows[i].doc);
        }

        $scope.unlockedLevels = levels;
        //$scope.$apply();

    /*
     * Then we get all the levels and place them on the view.
     * This will take into consideration if the level has been unlocked or not.
     */
        DBGetLevels(function (err, result) {
            if (err)
                return;

            var levels = [];
            var difficulties = [];

            // First we loop through the levels to get the different difficulties
            for (var i = 0; i < result.rows.length; i++) {
                var difficulty = result.rows[i].doc.difficulty;

                if (difficulties.indexOf(difficulty) == -1)
                    difficulties.push(difficulty);
            }

            // Then we create the objects in the levels array followinf this pattern
            // {difficulty, [levels]}
            for (var i = 0; i < difficulties.length; i++) {
                levels.push({
                    name : difficulties[i],
                    levels : []
                });
            }

            // The we loop again through the levels adding each to the levels inner array
            for (var i = 0; i < result.rows.length; i++) {
                var level = result.rows[i].doc;

                for (var j = 0; j < levels.length; j++) {
                    if (levels[j].name == level.difficulty) {
                        if (!$scope.unlockedLevels.contains(level)) {
                            level.imageName = 'lock.png';
                            level.isUnlocked = false;
                        } else
                            level.isUnlocked = true;

                        levels[j].levels.push(level);
                    }
                }
            }

            // Dear programmer, I know this is a nasty amount of loops. If i have time I will refactor.

            // Then we fill the levels array with actual levels
            $scope.levels = levels;
            $scope.$apply();
        });
    });

    /*
     * This is the definition for the contains function for arrays.
     */
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i]._id === obj._id) {
                return true;
            }
        }
        return false;
    };

    /*
     * This function will recieve the amount of levels per category and
     * return an array with the amount of rows of levels per category.
     */
    $scope.divideRows = function(length) {
        return new Array(length / 5);
    };
    
    /* Returns true if the row's hand must be shown, false otherwise */
    $scope.showHand = function (categoria, fila) {
		var numHands = $scope.user.hands;
		var level = parseInt(categoria.levels[fila*5 + 4]._id);
		if (numHands * 5 > level)
			return true;
		else
			return false;
	}
	
	/* Alternates between "izq" and "der" for each hand. Returns "der" for
	 *  even row numbers and "izq" for odd row numbers.
	 */
	$scope.chooseHand = function(category, row) {
		var numHand = parseInt(category.levels[row*5 + 4]._id);
		numHand = Math.floor(numHand/5);
		if (numHand % 2 == 0)
			return "der";
		else
			return "izq";
	}
	
	// Muestra un dato curioso. De ser necesario desbloquea el siguiente nivel
	$scope.mostrarDato = function (categoria, fila) {
		var levelId = parseInt(categoria.levels[fila*5 + 4]._id);
		var numDato = Math.floor(levelId/5);
		
		// se busca el nivel y se desbloquea de ser necesario
		var categoria;
		for (categoria in $scope.levels) {
			var levels = $scope.levels[categoria].levels;
			var i;
			for (i in levels) {
				if ((parseInt(levels[i]._id) == levelId + 1) && (!levels[i].isUnlocked)) {
					levels[i].isUnlocked = true;
					levels[i].imageName = "done.png";
					$scope.user.levels.push((levelId + 1).toString());
					DBUpdateUser($scope.user, function(err, response) {
						if (err)
							console.log(err);
						else {
							$scope.user._rev = response.rev
						}
					});
				}
			}
		}
		
		// ahora mostramos el dato curioso
		var estilo = document.getElementById('invisible').style;
		estilo.display='table';
		$scope.datoCurioso = $sce.trustAsHtml(DatosCuriosos[numDato]);
    }
    
    $scope.esconderDato = function () {
		document.getElementById('invisible').style.display='none';
	}
}]);
