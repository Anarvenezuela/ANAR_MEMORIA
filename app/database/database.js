// Atts: id, password, levels [1..*], cards [0..*], highscore, hands
// Descomentar para usar base de datos remota
//var db_user = new PouchDB('http://anar-user-leotms.c9users.io:8080/anar_user', {ajax: {timeout: 10000}});
// Descomentar para usar base de datos local
var db_user  = new PouchDB('anar_user');
// Atts: id, name, cards, numPieces, time, difficulty, imageName
// Functions: getPieces(), getCardsOnWin(), getPoints()
//var db_level = new PouchDB('http://anar-user-leotms.c9users.io:8080/anar_level');
// Atts: id, name, image, description, number
//var db_card  = new PouchDB('http://anar-user-leotms.c9users.io:8080/anar_card');
var db_level = new PouchDB('anar_level');
var db_card  = new PouchDB('anar_card');

function DBCreateDB() {
    // Buscamos todos los docs en la base de niveles. Si no hay los creamos.
    db_level.allDocs({}, function(err, response) {
        if (err)
            console.log(err);

        if (response.total_rows == 0)
            DBCreateLevels();
    });

    // Igual con las cartas
    db_card.allDocs({}, function(err, response) {
        if (err)
            console.log(err);

        if (response.total_rows == 0)
            DBCreateCards();
    });
}

/*
 * User module
 */

function DBregisterUser(id, password, callback) {

    var user = {
        _id: id,
        password: password,
        highscore: 0,
        multiplayer_highscore: 0,
        levels: ["0"],
        cards: [],
        hands: 0
    };

    db_user.put(user).then(function(result) {
        user._rev = result.rev;
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

function DBUpdateUser(user, callback) {
    db_user.put(user).then(function(result) {
        callback(null, result);
    }).catch(function(err) {
        callback(err.status, null);
    });
}
    /*
     * End User module
     */

function shuffle(o){ //try this shuffle function
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

/*
 * Level module
 */

 function getArray(min, max) {
    // var array = [];
    var result = [];

    for (var i = min; i < max; i++) {
        result.push(i.toString());
    }

    var reverse = result.reverse();

    return result.concat(reverse);
 }

function DBCreateLevels() {
    var level = {};
    var j;

    for (var i = 0; i < 70; i++) {
        if (i < 5) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(0, 5),
                numPieces: 10,
                time: '100',
                difficulty: 'Fácil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 10) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(5, 10),
                numPieces: 10,
                time: '80',
                difficulty: 'Fácil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 15) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(10, 15),
                numPieces: 10,
                time: '60',
                difficulty: 'Intermedio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 20) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(15, 20),
                numPieces: 10,
                time: '60',
                difficulty: 'Intermedio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 25) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(20, 25),
                numPieces: 10,
                time: '60',
                difficulty: 'Intermedio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 30) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(25, 30),
                numPieces: 10,
                time: '45',
                difficulty: 'Medio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 35) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(30, 35),
                numPieces: 10,
                time: '45',
                difficulty: 'Medio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 40) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(35, 40),
                numPieces: 10,
                time: '45',
                difficulty: 'Medio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 45) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(40, 45),
                numPieces: 10,
                time: '45',
                difficulty: 'Medio',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 50) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(45, 50),
                numPieces: 10,
                time: '30',
                difficulty: 'Difícil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 55) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(50, 55),
                numPieces: 10,
                time: '30',
                difficulty: 'Difícil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 60) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(60, 65),
                numPieces: 10,
                time: '30',
                difficulty: 'Difícil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 65) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(60, 65),
                numPieces: 10,
                time: '30',
                difficulty: 'Difícil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };

        } else if (i < 65) {
            level = {
                _id: i.toString(),
                name: 'Nivel ' + i,
                cards: getArray(65, 70),
                numPieces: 10,
                time: '30',
                difficulty: 'Difícil',
                imageName: 'done.png',
                nextLevel: (i+1).toString()
            };
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

function DBUnlocklevel(user, level, callback) {
    user.levels.push(level.nextLevel);

    db_user.put(user).then(function(result) {
        callback(null, user);
    }).catch(function(err) {
        callback(err.status, null);
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

    for (var i = 0; i < 70; i++) {
        card = {
            _id: i.toString(),
            name: 'Carta ' + i,
            image: 'images/cards/' + i + '.png',
            description: '',
            number: i
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

function DBGetCards(callback) {
    db_card.allDocs({
        include_docs: true,
    }, function(err, response) {
        // Sorts the response according to the number attribute
        if (response) {
            response.rows.sort(function(a, b) {
                    if (a.doc.number > b.doc.number) return 1;
                    else if (a.doc.number < b.doc.number) return -1;
                    else return 0;
                });
        }
        callback(err, response);
    });
};

function DBGetLevelCards(level, callback) {
    db_card.allDocs({
        include_docs: true,
        keys: level.cards
    }, function(err, response) {
        callback(err, response);
    });
};

function DBUnlockCard(user, card, callback) {
    for (var i = 0; i < user.cards.length; ++i) {
        if (user.cards[i] == card._id) {
            callback(0, null);
            return;
        }
    }

    user.cards.push(card._id);

    db_user.put(user).then(function(result) {
        callback(null, user);
    }).catch(function(err) {
        callback(err.status, null);
    });
}

/*
 * End Card module
 */
