const config = {
    maxNumPlayers: 8, 				// Number of players allowed in each game at a time
    minNumPlayers: 3, 				// Number of players needed to start the game
    chatEnabled: true,              // Display chat underneath game
    universalChatEnabled: true		// Allow players to select universal chat
};

const gameLogic = require('./shared/game-logic.js');
const chat = require('./shared/chat.js');

module.exports = Preab;

function Preab(io) {
    const nsp = io.of('/preab');
    nsp.on('connection', function(socket){
        gameLogic.registerSocketEvents(socket, config);
       if (config.chatEnabled) chat.registerSocketEvents(socket, gameLogic);
    });
}
