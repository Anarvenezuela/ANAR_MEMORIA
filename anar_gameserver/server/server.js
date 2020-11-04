var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();



app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    //app.start();
    app.io = require('socket.io')(app.start());

    // Escuchamos a conexiones entrantes
    app.io.on('connection', function(socket){
      console.log('Un usuario se conecto');

      // El usuario se desconecta
      socket.on('disconnect', function(){
          console.log('Un usuario se desconecto');
      });

      // Cuando los dos jugadores estan listo, se emite el mensaje para comenzar
      // el juego.
      socket.on('create_game',function(gameid) {
          console.log('un jugador creo la sala de juego ' + gameid);
          socket.join(gameid);
          console.log('Se unio al jugador 1 a la sala de juego ' + gameid);
      });

      // Cuando los dos jugadores estan listo, se emite el mensaje para comenzar
      // el juego.
      socket.on('players_ready',function(gameid) {
          console.log('Los jugadores estan listos');
          socket.join(gameid);
          console.log('Se unio al jugador 2 a la sala de juego ' + gameid)
          app.io.to(gameid).emit('start_game');
      });

      // Cada vez que un jugador sube sus puntos, se actualizan ambos clientes.
      socket.on('new_score',function(gameid){
          console.log("Actualicen los puntajes.");
          app.io.to(gameid).emit("update_scores");
      });

      // Cada vez que un jugador abandona la partida, se le anuncia a su
      // contrincante.
      socket.on("player_logout",function(username, gameid){
          console.log('El jugador ' + username + " ha abandonado la partida.");
          app.io.to(gameid).emit("player_logout",username);
      });

      // Cuado se pide que se muestre la carta
      socket.on("show_card",function(card, gameid){
          console.log('Uno de los jugadore volteo la carta ' + card);
          socket.broadcast.to(gameid).emit("show_card",card);
      });
    });
});
