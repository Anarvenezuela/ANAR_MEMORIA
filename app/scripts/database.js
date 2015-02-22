// Atts: id, password, levels [1..*], cards [1..*], highscore
var db_user = new PouchDB('ANAR_USER');
// Atts: id, name, numPieces, time, difficulty
// Functions: getPieces(), getCardsOnWin(), getPoints()
var db_level = new PouchDB('ANAR_LEVEL2');
// Atts: id, name, image, description
var db_card = new PouchDB('ANAR_CARD');

/*
 * User module
 */

function DBregisterUser(id, password, callback) {

    var user = {
        _id: id,
        password: password,
        highscore: 0,
        levels: ["1"],
        cards: []
    };

    db_user.put(user).then(function(result) {
        callback(null, user);

    }).catch(function(err) {
        callback(err.status, null);
    });
}

function DBloginUser(id, password, callback) {
    db_user.get(id).then(function(doc) {
        if (doc.password == password)
            callback(null, doc);
        else
            callback(401, null);

    }).catch(function(err) {
        callback(err.status, null);
    });
}

function DBGetHighscores(callback) {
        db_user.allDocs({
            include_docs: true
        }, function(err, response) {
            if (response) {
                response.rows.sort(function(a, b) {
                    if (a.doc.highscore < b.doc.highscore) return 1;
                    else if (a.doc.highscore > b.doc.highscore) return -1;
                    else return 0;
                });
            }
            callback(err, response);
        });
    }
    /*
     * End User module
     */

/*
 * Level module
 */

function DBCreateCards() {
    var level = {};

    for (var i = 0; i < 30; i++) {
        if (i < 10)
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                numPieces: 10,
                time: '120',
                difficulty: 'easy'
            };
        else if (i < 20)
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                numPieces: 20,
                time: '60',
                difficulty: 'medium'
            };
        else
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                numPieces: 30,
                time: '30',
                difficulty: 'hard'
            };

        db_level.put(level);
    }
}

/* Gets the user levels. */
function DBGetUserLevels(user, callback) {
    db_level.allDocs({
        include_docs: true,
        keys: user.levels
    }, function(err, response) {
        callback(err, response);
    });
}

// TODO get total levels by category
function DBGetLevels(callback) {
    db_level.allDocs({
        include_docs: true
    }, function(err, response) {
        callback(err, response);
    });
}

/*
 * End Level module
 */

/*
 * Card module
 */

function DBCreateCards() {
    var card = {};

    for (var i = 0; i < 60; i++) {
        card = {
            _id: i.toString(),
            name: 'Carta ' + i,
            image: "images/icon-128.png",
            description: 'Lorem ipsum donor amet.'
        };

        db_card.put(card);
    }
}

function DBGetUserCards(user, callback) {
    db_card.allDocs({
        include_docs: true,
        keys: user.cards
    }, function(err, response) {
        callback(err, response);
    });
};

/*
 * End Card module
 */
