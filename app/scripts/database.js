// Atts: id, password, levels [1..*], cards [1..*], highscore
var db_user = new PouchDB('ANAR_USER');
// Atts: id, name, numPieces, time, difficulty
// Functions: getPieces(), getCardsOnWin(), getPoints()
var db_level = new PouchDB('ANAR_LEVEL');
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
    levels: [],
    cards: [] 
  };

  db_user.put(user).then(function (result) {
    callback(200);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

function DBloginUser(id, password, callback) {
  db_user.get(id).then(function (doc) {
      if (doc.password == password)
        callback(200);
      else
        callback(401);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

function DBgetUserHighscore(id, callback) {
  db_user.get(id).then(function (doc) {
    callback(doc.highscore);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

function DBsetUserHighscore(id, new_highschore) {
  db_user.get(id).then(function (doc) {
    doc.highscore = new_highschore;
    db_user.put(doc);

  }).catch(function (err) {
    console.log(err);
  });
}

function DBaddScoreToUserHighscore(id, score) {
  db_user.get(id).then(function (doc) {
    doc.highscore += score;
    callback(db_user.put(doc));
  
  }).catch(function (err) {
    console.log(err);
  });
}

function DBaddUserLevel(id, lvl_id){
  db_user.get(id).then(function (doc) {
    doc.levels.push(lvl_id);
    doc.levels.sort(function(a, b){return a-b});

    callback(db_user.put(doc));
  
  }).catch(function (err) {
    callback(err.status);
  });
}

function DBgetUserLevelsIds(id, callback) {
  db_user.get(id).then(function (doc) {
    callback(doc.levels);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

// function idToSearch(levelId) {
//   return function searchLevel(callback) {
//     db_level.get(levelId, function(err, doc){
//       callback(err, doc);
//     })
//   });
// }

// function DBgetUserLevels(id, callback) {
//   db_user.get(id).then(function (doc) {
//     var searchArray = [];
//     for (i = 0; i < doc.levels.length; ++i) {
//       searchArray.push(idToSearch(doc.levels[i]));
//     }

//     searchArray = _.map(doc.levels, function(level) {
//       return idToSearch(level);
//     })

//     async.parallel(searchArray, function searchDone(err, results) {
//       if (err)
//         return;
//       //results

//       callback(results);
//     })
  
//   }).catch(function (err) {
//     callback(err.status);
//   });
// }

function DBgetUserLevels(id, callback) {
  db_user.get(id).then(function (doc) {
    var levels_ids = doc.levels;
    var result = db_level.allDocs({include_docs: true}, function(err, response){
      console.log('inside alldocs ' + JSON.stringify(response.rows));
      return response;
    });
    return result;
  }).then(function (result) {
    // all_docs = result[0];
    // level_ids = result[1];
    // search_result = [];
    console.log(result);
    search_result = result;

    // // Iterates over the levels ids of the user
    // for (var i = level_ids.length - 1; i >= 0; i--) {
    //   // Finds the level with the corresponding id and adds it to the 
    //   // search_result array
    //   for (var j = all_docs.rows.length - 1; j >= 0; j--) {
    //     if (all_docs.rows[j].doc._id == level_ids[i]) {
    //       search_result.push(all_docs.rows[j].doc);
    //       break;
    //     }
    //   };
    // };
    
    callback(search_result);
  }).catch(function (err) {
    console.log('error get user levels');
    callback(err.status);
  });
}

function DBaddUserCard(id, card_id, callback){
  db_user.get(id).then(function (doc) {
    doc.levels.push(card_id);
    doc.levels.sort();
    callback(db_user.put(doc));
  
  }).catch(function (err) {
    callback(err.status);
  });
}

function DBgetUserCardsIds(id, callback) {
  db_user.get(id).then(function (doc) {
    callback(doc.cards);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

/*
 * End User module
 */

/*
 * Level module
 */

function DGgetLevel(id) {
  db_level.get(id).then(function (doc) {
    callback(doc);
  
  }).catch(function (err) {
    callback(err.status);
  });
}

// Have to assign the proper start and end keys, depends on the lvl in the DB
function DBgetLevelsByDifficulty(difficulty) {
  if (difficulty == 'easy') {
    result = db_level.allDocs({startkey : 'easy1', endkey : 'easy10', include_docs: true});
  } else if (difficulty == 'medium') {
    result = db_level.allDocs({startkey : 'medium1', endkey : 'medium10', include_docs: true});
  } else if (difficulty == 'hard') {
    result = db_level.allDocs({startkey : 'hard1', endkey : 'hard10', include_docs: true});
  };

  return result;
}

/*
 * End Level module
 */

/*
 * Card module
 */

/*
 * End Card module
 */
