//----------------------------------------------
// 			CONSTANTS
//---------------------------------------------- 

var MAX_SERVER_PLAYERS = 100; 			// Number of players allowed on server at one time
var MAX_GAME_PLAYERS = 4; 				// Number of players allowed in each game at a time
var MIN_GAME_PLAYERS = 2; 				// Number of players needed to play

var CHAT = true;						// Display chat underneath game
var UNIVERSAL_CHAT = true;				// Allow players to select universal chat

var TRACK_CONTROLS = false;				// Capture key press events

//----------------------------------------------
// 			Set Up Express
//---------------------------------------------- 
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.OPENSHIFT_NODEJS_PORT || 2000);
//serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//-----------------------------------------------------
// 				Set Up Socket.io and Players
//-----------------------------------------------------

var io = require('socket.io')(serv,{});

// Keep track of sockets, players usernames and games in use
var SOCKET_LIST = [];
var PLAYER_LIST = [];
var GAME_LIST = [];

// Generate a list of public games every 5 seconds
var publicGames;
setInterval(function() {
		publicGames = "List of Public Games: </div><div>";
		for(var i in GAME_LIST){
			if (GAME_LIST[i].gamePassword === "")
				if(GAME_LIST[i].numPlayers < MAX_GAME_PLAYERS)
					if (publicGames.indexOf(GAME_LIST[i].name)==-1)
						publicGames += GAME_LIST[i].name + "</div><div>";
		}
}, 3000);


io.sockets.on('connection', function(socket){
	//If lobby is full
	if (SOCKET_LIST.length >= MAX_SERVER_PLAYERS){
		socket.emit('lobbyFull');
		console.log("Lobby full error");
		socket.disconnect();
		return;
	}
	
	// Register Socket upon Connection
	do {//Generate a random socket id for each new connection
		socket.id = Math.floor(Math.random()*MAX_SERVER_PLAYERS);
	} while (SOCKET_LIST[socket.id] != null)		
	SOCKET_LIST[socket.id] = socket;
	
	// When user disconnects
	socket.on('disconnect',function(){
		disconnectUser(socket);
	});
	
	// User Sign In
	socket.on('signIn',function(username){
		if (isUsernameTaken(username)){
				socket.emit('signInResponse',{success:false});		
		} else { // If username is free add user
			addUser(username, socket);
			socket.emit('signInResponse',{success:true});
		}		
	});
	
	// Call for public games
	socket.on('gameSelection', function (){
		socket.emit('publicGames', publicGames);
	});
	
	// Game Creation
	socket.on('createGame',function(name, gamePassword){
		if (findGame(name)!=-1){
				socket.emit('createGameResponse',{success:false});		
		} else { // If game name is free join game as first users
			createGame(name, socket, gamePassword);
			socket.emit('createGameResponse',{success:true, chat:CHAT, universal:UNIVERSAL_CHAT, controls:TRACK_CONTROLS});
		}		
	});
	
	// Joining a Game
	socket.on('joinGame',function(name, gamePassword){
		var i = findGame(name);
		if (i==-1){
				socket.emit('joinGameResponse',{success:false, gameExist:false});		
		} else { // If game already has (a) player(s) join game as another user
			if(GAME_LIST[i].gamePassword === gamePassword){
				if(GAME_LIST[i].numPlayers < MAX_GAME_PLAYERS){
					joinGame(name, socket, (GAME_LIST[i].numPlayers) + 1, gamePassword);
					socket.emit('joinGameResponse',{success:true, chat:CHAT, universal:UNIVERSAL_CHAT, controls:TRACK_CONTROLS});
				} else
					socket.emit('joinGameResponse', {success: false, gameFull:true});
			} else 
				socket.emit('joinGameResponse',{success:false, gameExist:true});
		}		
	});
	
	//	Universal Chat
	socket.on('sendMsgToServer',function(data){ // When user sends a message
		for(var i in SOCKET_LIST){
			var str = PLAYER_LIST[socket.id] + ': ' + data;
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});
	
	//	In-game Chat
	socket.on('sendMsgToGame',function(data){ // When user sends a message
		for(var i in GAME_LIST){
			if (GAME_LIST[socket.id].name==GAME_LIST[i].name){
				var str = PLAYER_LIST[socket.id] + ': ' + data;
				SOCKET_LIST[i].emit('addToGame',str);
			}
		}
	});
	
	// Key Presses for controls
	socket.on('keyPress', function(data){
		if (data.inputId === 'right'){
			rightClick(data.state, socket);
		}
		else if (data.inputId === 'down'){
			downClick(data.state, socket);
		}
		else if (data.inputId === 'left'){
			leftClick(data.state, socket);
		}
		else if (data.inputId === 'up'){
			upClick(data.state, socket);
		}
	});
});

disconnectUser = function (socket){
	removePlayerFromGame(socket.id);
	if (CHAT){
		for(var i in GAME_LIST){ // Inform other users that player has disconnected
			if (GAME_LIST[socket.id].name==GAME_LIST[i].name){
				var str = PLAYER_LIST[socket.id] + ' has disconnected from the game';
				SOCKET_LIST[i].emit('addToGame',str);
			}
		}
	}
	
	delete PLAYER_LIST[socket.id];
	delete SOCKET_LIST[socket.id]; 
	delete GAME_LIST[socket.id];
}

isUsernameTaken= function(name){
	if (PLAYER_LIST.indexOf(name)==-1) return(false);
	else return(true);
}

addUser = function(name, socket){
	PLAYER_LIST[socket.id] = name;
}

findGame = function(name){
	for (var i in GAME_LIST)
		if (GAME_LIST[i].name == name)
			return i;
	return -1;	
}

createGame = function(name, socket, gamePassword){
	GAME_LIST[socket.id]= {name:name, gamePassword:gamePassword, numPlayers:1};
}

joinGame = function(name, socket, numPlayers, gamePassword){
	GAME_LIST[socket.id]= {name:name, gamePassword:gamePassword, numPlayers:numPlayers};
	if (CHAT)
		for (var i in GAME_LIST)
			if (GAME_LIST[i].name == GAME_LIST[socket.id].name){
				GAME_LIST[i].numPlayers = numPlayers;
				var str = PLAYER_LIST[socket.id] + ' has connected to the game';
				SOCKET_LIST[i].emit('addToGame',str);
			}
}

removePlayerFromGame = function(id){
	for (var i in GAME_LIST)
		if (GAME_LIST[i].name == GAME_LIST[id].name)
			GAME_LIST[i].numPlayers--;
}

//---------------------------------------------
//				CONTROLS
//---------------------------------------------

upClick = function(pressed, socket){
	if(pressed){ // Up key is pressed
		SOCKET_LIST[socket.id].emit('addToGame', 'You pressed up');
	}
}

downClick = function(pressed, socket){
	if(pressed){ // Down key is pressed
		SOCKET_LIST[socket.id].emit('addToGame', 'You pressed down');
	}
}

leftClick = function(pressed, socket){
	if(pressed){ // Left key is pressed
		SOCKET_LIST[socket.id].emit('addToGame', 'You pressed left');
	}
}

rightClick = function(pressed, socket){
	if(pressed){ // Right key is pressed
		SOCKET_LIST[socket.id].emit('addToGame', 'You pressed right');
	}
}