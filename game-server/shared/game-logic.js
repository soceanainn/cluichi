const gamesList = {
    // "game1": {"isStarted": true},
    // "game2": {"password": null, "isStarted": false},
    // "game3": {"isStarted": false}
};

module.exports.registerSocketEvents = registerSocketEvents;
module.exports.gamesList = getGamesList();

function registerSocketEvents(socket, config){
    socket.on('disconnect',function(){
        disconnectUser(socket);
    });

    socket.on('login', function(username){
        socket.username = username;
        socket.emit('loggedIn', getPublicGames());
    });

    socket.on('fetchGames', function (){
        socket.emit('refreshGameList', getPublicGames());
    });

    socket.on('createGame', function(gameData){
        if (gamesList[gameData.name] == null) {
            gamesList[gameData.name] = {
                "password": gameData.password,
                "isStarted": false,
                "members": [socket.id],
                "votesToStart": []
            };
            socket.game = gameData.name;
            socket.emit('createdGame', gameData.name);
        } else {
            socket.emit('gameAlreadyExists');
        }
    });

    socket.on('joinGame', function (gameData) {
        if (gamesList[gameData.name] == null) {
            socket.emit('gameDoesntExist');
        } else {
            for (const m in gamesList[gameData.name].members) {
                socket.broadcast.to(gamesList[gameData.name].members[m]).emit('playerJoined', socket.username);
            }
            gamesList[gameData.name].members.push(socket.id);
            socket.game = gameData.name;
            socket.emit('joinedGame', gameData.name);
        }
    });

    socket.on('voteToStart', function(){
        if (!gamesList.isStarted && gamesList[socket.game].votesToStart.indexOf(socket.id) === -1){
            gamesList[socket.game].votesToStart.push(socket.id);
            for (const m in gamesList[socket.game].members) {
                if (gamesList[socket.game].members[m] === socket.id) socket.emit('votedToStart', socket.username);
                else socket.broadcast.to(gamesList[socket.game].members[m]).emit('votedToStart', socket.username);
            }

            if (gamesList[socket.game].votesToStart.length > config.minNumPlayers){
                gamesList[socket.game].isStarted = true;
                for (const m in gamesList[socket.game].members) {
                    if (gamesList[socket.game].members[m] === socket.id) socket.emit('startGame');
                    else socket.broadcast.to(gamesList[socket.game].members[m]).emit('startGame');
                }
            }
        }
    });
}

function getPublicGames(){
    const list = [];
    for (const g in gamesList){
        const game = gamesList[g];
        if (game.password == null && !game.isStarted)
            list.push(g);
    }
    if (list.length !== 0) {
        return "<ul><li>" + list.join("</li><li>") + "</li></ul>";
    }
    return null;
}

function disconnectUser(socket) {
    let game = gamesList[socket.game];
    if (game != null) {
        game.members = game.members.filter(function(v){ return v !== socket.id });
        for (const m in game.members) {
            socket.broadcast.to(game.members[m]).emit('playerDisconnected', socket.username);
            if (game.isStarted && games.members.length < config.minNumPlayers) {
                socket.broadcast.to(game.members[m]).emit('gameAbandoned');
            } else if (!game.isStarted && game.members.length === config.minNumPlayers - 1) {
                socket.broadcast.to(game.members[m]).emit('minimumPlayersNotMet');
                game.votesToStart = [];
            }
        }
        if (game.isStarted && games.members.length < config.minNumPlayers || game.members.length === 0) {
            delete gamesList[socket.game];
        }
    }
}

function getGamesList(){
    return gamesList;
}
