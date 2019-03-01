//----------------------------------------------
// 			CONSTANTS
//----------------------------------------------

var MAX_SERVER_PLAYERS = 100; 			// Number of players allowed on server at one time
var MAX_GAME_PLAYERS = 5; 				// Number of players allowed in each game at a time
var MIN_GAME_PLAYERS = 3; 				// Number of players needed to start the game

var CHAT = true;						// Display chat underneath game
var UNIVERSAL_CHAT = true;				// Allow players to select universal chat

var TRACK_CONTROLS = false;				// Capture key press events
var INCLUDE_WASD = false;				// Allow WASD to be used as arrow keys

socketio.on('connection', function (socket) {
    // ...

    socket.on('isOnline', function (user_id) {
        require('user-online.js').register(socket, user_id);
    });

    socket.on('sendNotification', function (args) {
        require('notification/handler.js').handler(socket, args);
    });

    // ...
});

//---------------------------------------------
//			CARDS AGAINST HUMANITY
//---------------------------------------------

// Read in a deck of answer cards


// When a user plays a card
exports.playedCard= function(data){
    var output = {playerId : socket.id, str : data};
    SOCKET_LIST[PLAYER_LIST[socket.id].host].emit('played', output);
    for(var i in PLAYER_LIST){
        if (PLAYER_LIST[socket.id].host==PLAYER_LIST[i].host){
            var str = "D'imir " + PLAYER_LIST[socket.id].name + ' cárta.';
            SOCKET_LIST[i].emit('addToGame',str);
        }
    }
};

// When a user needs to draw an answer card
exports.drawAnswer= function(id){
    SOCKET_LIST[PLAYER_LIST[socket.id].host].emit('requestAnswer', {cardId: id, socket: socket.id});
};

exports.hostAnswer= function(data){
    SOCKET_LIST[data.socket].emit('answerCard', data);
};

// Update the scoreboard
function updateScores(id){
    var str = '<h3 style = "text-align: center">Scoreboard</h3>';
    var winner = null;
    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[id].host == PLAYER_LIST[i].host){
            str += ('Scór ' + PLAYER_LIST[i].name + " ná: " + PLAYER_LIST[i].score + "<br>");
            if (PLAYER_LIST[i].score == 10)
                winner = "Tá an cluiche thart anois. Bhuaigh " + PLAYER_LIST[i].name + "!";
        }

    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[id].host == PLAYER_LIST[i].host){
            if (winner != null)
                SOCKET_LIST[i].emit('endOfGame', winner);
            else
                SOCKET_LIST[i].emit('updateScores', str);
        }
}

// New Turn
exports.newTurn= function(){
    updateScores(socket.id);
    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[i].host = socket.id)
            SOCKET_LIST[i].emit('newTurn');
};

// New Card Czar
exports.cardCzar= function(data){
    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[i].host = socket.id){
            SOCKET_LIST[i].emit('newQuestion', data.str);
            SOCKET_LIST[i].emit('addToGame', 'Is iad ' + PLAYER_LIST[data.socket].name + " Sár na gCártaí.");
        }
    SOCKET_LIST[data.socket].emit('cardCzar');
};

// Card Czar Must Judge
exports.judge= function(data){
    // Display answers
    var strings = data.str.split(/<>/).filter(Boolean);
    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[i].host = socket.id)
            for (var j = 0; strings[j*2]!=null; j++)
                SOCKET_LIST[i].emit('addToGame', "Is é freagra # " + j + " ná: " + strings[j*2] + ".");
    // Send data to card czar for judging
    SOCKET_LIST[data.socket].emit('judge', data.str);
};

exports.czarSelected= function (data){
    for (var i in PLAYER_LIST)
        if (PLAYER_LIST[i].host == PLAYER_LIST[socket.id].host)
            SOCKET_LIST[i].emit('addToGame', "Bhuaigh " + PLAYER_LIST[data.winner].name + " le : " + data.str);
    PLAYER_LIST[data.winner].score++;
    updateScores(data.winner);
    SOCKET_LIST[PLAYER_LIST[data.winner].host].emit('judged');
    console.log('judged ' + PLAYER_LIST[PLAYER_LIST[data.winner].host].name);
};

// Start Game (host)
exports.startGame= function(){
    if (GAME_LIST[socket.id].numPlayers >= MIN_GAME_PLAYERS){
        startGame(socket.id);
        updateScores(socket.id);
    }else
        socket.emit('minPlayersNotMet', {numPlayers: GAME_LIST[socket.id].numPlayers, playersNeeded: MIN_GAME_PLAYERS});
};
