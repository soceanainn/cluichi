module.exports.registerSocketEvents = registerSocketEvents;

function registerSocketEvents(socket, shared){
    socket.on('sendChat', function (input) {
        let message = socket.username + ": " + input;
        let gamesList = shared.gamesList;

        if (gamesList[socket.game] != null) {
            for (const m in gamesList[socket.game].members) {
                if (gamesList[socket.game].members[m] === socket.id) socket.emit('addToChat', message);
                else socket.broadcast.to(gamesList[socket.game].members[m]).emit('addToChat', message);
            }
        }
    });
}
