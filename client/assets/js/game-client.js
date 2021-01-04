socket.on('loggedIn', function (games){
    displayPublicLobby(games);
});

socket.on('refreshGameList', function(games){
    document.getElementById('gameList').innerHTML = games;
});

socket.on('createdGame', function(name){
    displayGameLobby(name)
});

socket.on('playerJoined', function(name){
    addToChat("<i>Cheangail " + name + " leis an gcluiche</i>");
});

socket.on('playerDisconnected', function(name){
    addToChat("<i>Dícheangail " + name + " ón gcluiche</i>");
});

socket.on('joinedGame', function(name){
    displayGameLobby(name);
    addToChat("<i>Cheangail tú leis an gcluiche</i>");
});

socket.on('addToChat',function(data){
    addToChat(data);
});

socket.on('minimumPlayersMet', function(){
    displayVoteToStart();
});

socket.on('minimumPlayersNotMet', function(){
    displayNotEnoughPlayers();
});

function login(){
    socket.emit('login', document.getElementById('username').value.trim());
}

function refreshPublicGames(){
    socket.emit('fetchGames');
}

function createGame(){
    socket.emit('createGame', getGameConnectionInfo());
}

function joinGame(){
    socket.emit('joinGame', getGameConnectionInfo());
}

function getGameConnectionInfo(){
    const name = document.getElementById('gameName').value.trim();
    const password = document.getElementById('gamePassword').value.trim();
    if (password !== "") return {"name": name, "password": password};
    return {"name": name};
}

function displayPublicLobby(games){
    document.getElementById('signIn').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('gameList').innerHTML = games;
}

function displayGameLobby(){
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game-lobby').style.display = 'block';
}

function sendChat(){
    let message = document.getElementById('chat-input').value.trim();
    if (message.length > 0) {
        socket.emit('sendChat', message);
        document.getElementById('chat-input').value = '';
    }
}

function addToChat(data){
    let chatText = document.getElementById('chat-text');
    chatText.innerHTML += '<div>' + data + '</div>';
    chatText.scrollTop = chatText.scrollHeight;
}

function displayVoteToStart(){
    document.getElementById('vote-to-start').className = "btn btn-success offset-1 col-10 offset-md-4 col-md-4";
    document.getElementById('vote-to-start').setAttribute('aria-disabled', "false");
    document.getElementById('vote-to-start').style.display = 'block';
    document.getElementById('pregame').innerText = 'Ag fanacht ar go leor vótaí le tosú';
}

function displayNotEnoughPlayers(){
    document.getElementById('pregame').innerText = 'Ag fanacht ar breis imreoirí';
    document.getElementById('vote-to-start').style.display = 'none';
}

function voteToStart(){
    if (document.getElementById('vote-to-start').getAttribute('aria-disabled') !== "true") {
        socket.emit('voteToStart');
        document.getElementById('vote-to-start').setAttribute('aria-disabled', "true");
        document.getElementById('vote-to-start').className += " disabled";
    }
}
