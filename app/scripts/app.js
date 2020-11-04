'use strict';

var app    = angular.module('AnarApp', []);
// var io = require('socket.io-client');
// var socket = io.connect('http://localhost:3000');

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

app.factory('socket', function(){
    //Creating connection with server

    var socket = io.connect('http://0.0.0.0:3000/');
    socket.on('connect', function () {
      //socket.emit('server custom event', { my: 'data' });

      socket.on('update',function(){
        console.log('Me dijeron que me actualizara');
      });

    });

  return socket;

});

app.service('sharedGlobals', function () {
        var multiplayerDifficulty    = '';
        var multiplayerUnlokedDifficulties = 0;

        return {
            getDifficulty: function () {
                return multiplayerDifficulty;
            },
            setDifficulty: function(value) {
                multiplayerDifficulty = value;
            },
            getUlockedDifficulties: function () {
                return multiplayerUnlokedDifficulties;
            },
            setUlockedDifficulties: function(value) {
                multiplayerUnlokedDifficulties = value;
            }
        };
});

DBCreateDB();
