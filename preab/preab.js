const MAX_GAME_PLAYERS = 8; 				// Number of players allowed in each game at a time
const MIN_GAME_PLAYERS = 3; 				// Number of players needed to start the game

const CHAT = true;						    // Display chat underneath game
const UNIVERSAL_CHAT = true;				// Allow players to select universal chat
const gamesList = {
    // "game1": {"isStarted": true},
    // "game2": {"password": null, "isStarted": false},
    // "game3": {"isStarted": false}
};
module.exports = Preab;
function Preab(io) {
    const nsp = io.of('/preab');
    nsp.on('connection', function(socket){
       socketEvents(socket);
    });
}

function socketEvents(socket){
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
                "members": [socket.id]
            };
            socket.emit('createdGame', gameData.name);
        } else {
            socket.emit('gameAlreadyExists');
        }
    });

    socket.on('joinGame', function(gameData){
        if (gamesList[gameData.name] == null) {
            socket.emit('gameDoesntExist');
        } else {
            for (const m in gamesList[gameData.name].members){
                socket.broadcast.to(gamesList[gameData.name].members[m]).emit('playerJoined', socket.username);
            }
            gamesList[gameData.name].members.push(socket.id);
            socket.emit('joinedGame', gameData.name);
        }
    });
}

function getPublicGames(){
    const list = [];
    console.log("GAMES: " + Object.keys(gamesList));
    for (const g in gamesList){
        const game = gamesList[g];
        if (game.password == null && !game.isStarted)
            list.push(g);
    }
    return "<ul><li>" + list.join("</li><li>") + "</li></ul>";
}