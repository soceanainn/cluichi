const config = {
    maxNumPlayers: 5, 				// Number of players allowed in each game at a time
    minNumPlayers: 3, 				// Number of players needed to start the game
    chatEnabled: true,              // Display chat underneath game
    universalChatEnabled: true		// Allow players to select universal chat
};

const gameLogic = require('./shared/game-logic.js');
const chat = require('./shared/chat.js');

module.exports = Cartai;

function Cartai(io) {
    const nsp = io.of('/cartai');
    nsp.on('connection', function(socket){
        gameLogic.registerSocketEvents(socket, config);
        if (config.chatEnabled) chat.registerSocketEvents(socket, gameLogic);
    });
}

//---------------------------------------------
//			CARDS AGAINST HUMANITY
//---------------------------------------------
function cards(socket){
    // When a user plays a card
    socket.on('playedCard', function(data){
        let output = {playerId : socket.id, str : data};
        SOCKET_LIST[PLAYER_LIST[socket.id].host].emit('played', output);
        for(let i in PLAYER_LIST){
            if (PLAYER_LIST[socket.id].host === PLAYER_LIST[i].host){
                let str = "D'imir " + PLAYER_LIST[socket.id].name + ' cárta.';
                SOCKET_LIST[i].emit('addToGame',str);
            }
        }
    });

    // When a user needs to draw an answer card
    socket.on('drawAnswer', function(id){
        SOCKET_LIST[PLAYER_LIST[socket.id].host].emit('requestAnswer', {cardId: id, socket: socket.id});
    });

    socket.on('hostAnswer', function(data){
        SOCKET_LIST[data.socket].emit('answerCard', data);
    });

    // Update the scoreboard
    function updateScores(id){
        let str = '<h3 style = "text-align: center">Scoreboard</h3>';
        let winner = null;
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[id].host === PLAYER_LIST[i].host){
                str += ('Scór ' + PLAYER_LIST[i].name + " ná: " + PLAYER_LIST[i].score + "<br>");
                if (PLAYER_LIST[i].score === 10)
                    winner = "Tá an cluiche thart anois. Bhuaigh " + PLAYER_LIST[i].name + "!";
            }

        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[id].host === PLAYER_LIST[i].host){
                if (winner != null)
                    SOCKET_LIST[i].emit('endOfGame', winner);
                else
                    SOCKET_LIST[i].emit('updateScores', str);
            }
    }

    // New Turn
    socket.on('newTurn', function(){
        updateScores(socket.id);
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[i].host === socket.id)
                SOCKET_LIST[i].emit('newTurn');
    });

    // New Card Czar
    socket.on('cardCzar', function(data){
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[i].host === socket.id){
                SOCKET_LIST[i].emit('newQuestion', data.str);
                SOCKET_LIST[i].emit('addToGame', 'Is iad ' + PLAYER_LIST[data.socket].name + " Sár na gCártaí.");
            }
        SOCKET_LIST[data.socket].emit('cardCzar');
    });

    // Card Czar Must Judge
    socket.on('judge', function(data){
        // Display answers
        let strings = data.str.split(/<>/).filter(Boolean);
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[i].host === socket.id)
                for (let j = 0; strings[j*2]!=null; j++)
                    SOCKET_LIST[i].emit('addToGame', "Is é freagra # " + j + " ná: " + strings[j*2] + ".");
        // Send data to card czar for judging
        SOCKET_LIST[data.socket].emit('judge', data.str);
    });

    socket.on('czarSelected', function (data){
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[i].host === PLAYER_LIST[socket.id].host)
                SOCKET_LIST[i].emit('addToGame', "Bhuaigh " + PLAYER_LIST[data.winner].name + " le : " + data.str);
        PLAYER_LIST[data.winner].score++;
        updateScores(data.winner);
        SOCKET_LIST[PLAYER_LIST[data.winner].host].emit('judged');
        console.log('judged ' + PLAYER_LIST[PLAYER_LIST[data.winner].host].name);
    });

    // Start Game (host)
    socket.on('startGame', function(){
        if (GAME_LIST[socket.id].numPlayers >= MIN_GAME_PLAYERS){
            startGame(socket.id);
            updateScores(socket.id);
        }else
            socket.emit('minPlayersNotMet', {numPlayers: GAME_LIST[socket.id].numPlayers, playersNeeded: MIN_GAME_PLAYERS});
    });
});

//---------------------------------------------
//			User Socket functions
//---------------------------------------------


function disconnectUser(socket){
    if (SOCKET_LIST[socket.id]==null) return;

    // Check if user had chosen a username, if not just delete from socket list
    if(PLAYER_LIST[socket.id]==null) {
        delete SOCKET_LIST[socket.id];
        return;
    }

    //Check if player had joined a game before disconnect
    if (PLAYER_LIST[socket.id].host!=null){
        // Check if game still exists
        if (GAME_LIST[PLAYER_LIST[socket.id].host]!=null){
            if (GAME_LIST[PLAYER_LIST[socket.id].host].started){
                for(let i in PLAYER_LIST){ // End game that player has disconnected from
                    if (PLAYER_LIST[socket.id].host === PLAYER_LIST[i].host){
                        let str = 'Tá ' + PLAYER_LIST[socket.id].name + " tar éis dícheangailt, tá an cluiche thart.";
                        SOCKET_LIST[i].emit('endOfGame',str);
                    }
                }
            } else {
                for(let i in PLAYER_LIST){ // Tell other players in game that user has disconnected
                    if (PLAYER_LIST[socket.id].host === PLAYER_LIST[i].host){
                        let str = 'Tá ' + PLAYER_LIST[socket.id].name + " tar éis dícheangailt.";
                        GAME_LIST[PLAYER_LIST[socket.id].host].numPlayers--;
                        SOCKET_LIST[i].emit('addToGame',str);
                    }
                }
            }
        }
    }

    //Remove game from GAME_LIST when the host disconnects
    if (PLAYER_LIST[socket.id].host === socket.id) delete GAME_LIST[socket.id];

    // Remove player from PLAYER_LIST on disconnect
    delete PLAYER_LIST[socket.id];
    delete SOCKET_LIST[socket.id];
}

isUsernameTaken= function(name){
    for (let i in PLAYER_LIST) // Check if  name is already taken
        if (PLAYER_LIST[i].name === name)
            return true;
    return false;
};

addUser = function(name, socket){
    PLAYER_LIST[socket.id] = {name: name, score: 0};
};

findGame = function(name){
    for (let i in GAME_LIST)
        if (GAME_LIST[i].name === name){
            return i;
        }
    return -1;
};

createGame = function(name, socket, gamePassword){
    GAME_LIST[socket.id]= {name:name, gamePassword:gamePassword, numPlayers:1, started:false};
    PLAYER_LIST[socket.id].host = socket.id;
    socket.emit('hosting');
};

joinGame = function(socket, host){
    PLAYER_LIST[socket.id].host = host;
    GAME_LIST[host].numPlayers++;
    if (CHAT)
        for (let i in PLAYER_LIST)
            if (PLAYER_LIST[i].host === host){
                let str = 'Tá ' + PLAYER_LIST[socket.id].name + ' tar éis ceangailt leis an gcluiche.';
                SOCKET_LIST[i].emit('addToGame',str);
            }
};

startGame = function(host){
    GAME_LIST[host].started = true;
    for (let i in PLAYER_LIST)
        if (PLAYER_LIST[i].host === host){
            SOCKET_LIST[host].emit('addPlayer', i);
            SOCKET_LIST[i].emit('startGame');
        }
};

socketio.on('connection', function (socket) {
    socket.on('isOnline', function (user_id) {
        require('user-online.js').register(socket, user_id);
    });

    socket.on('sendNotification', function (args) {
        require('notification/handler.js').handler(socket, args);
    });

    // ...
});
