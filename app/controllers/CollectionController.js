'use strict';

app.controller('CollectionController', function ($scope) {

    $scope.cards = [];
    $scope.unlockedCards = [];

    DBGetUserCards($scope.user, function (err, result) {
      if (err)
            return;

      $scope.unlockedCards = result.rows.sort(function(a, b) {
                    if (a.doc.number > b.doc.number) return 1;
                    else if (a.doc.number < b.doc.number) return -1;
                    else return 0;
                });

      $scope.$apply();

    /*
     * Then we get all the cards and place them on the view.
     * This will take into consideration if the level has been unlocked or not.
     */
    DBGetCards(function (err, result) {
        if (err)
            return;

        var cards = [];
        var difficulties = [];

        // We loop through the whole set of cards adding each one to the result
        // array.
        for (var i = 0; i < result.rows.length; i++) {
            var level = result.rows[i].doc

            // If the card hasn't been obtained by the user, change the image to
            // blocked. The obtained attribute is used to check at the view if
            // the user has the card
            if (!$scope.unlockedCards.contains(level)) {
                level.image = 'images/lock.png';
                level.description = "No has conseguido esta carta."
                level.obtained = false;
            } else
              level.obtained = true;

              cards.push(level);
        }

        // Then we fill the cards array with actual cards
        $scope.cards = cards;
        $scope.$apply();
    });
    });

    /*
     * This is the definition for the contains function for arrays.
     */
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i].doc._id === obj._id) {
                return true;
            }
        }
        return false;
    };

    $scope.showCard = function(card) {
        $scope.card = card;
        document.getElementById("modal").style.display="block";

    }

    $scope.hideCard = function() {
        $scope.card = {};
        document.getElementById("modal").style.display="none";

    }
});
