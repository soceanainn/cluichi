//----------------------------------------------
// 			CONSTANTS
//---------------------------------------------- 

var MAX_SERVER_PLAYERS = 100; 			// Number of players allowed on server at one time
var MAX_GAME_PLAYERS = 8; 				// Number of players allowed in each game at a time
var MIN_GAME_PLAYERS = 1; 				// Number of players needed to start the game

var CHAT = true;						// Display chat underneath game
var UNIVERSAL_CHAT = true;				// Allow players to select universal chat

var TRACK_CONTROLS = false;				// Capture key press events
var INCLUDE_WASD = false;				// Allow WASD to be used as arrow keys

//----------------------------------------------
// 			Set Up Express and Server
//---------------------------------------------- 
var express = require('express');
var app = express();
var server = require('http').Server(app);

server.listen(process.env.PORT || 2000);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname + '/client'));
console.log("Server started.");

//-----------------------------------------------------
// 				Set Up Sockets, Players and Game
//-----------------------------------------------------

var io = require('socket.io')(server);
var numberOfPlayers = 0; //Number of players in lobby

// Keep track of sockets, players usernames,games, and scores in use
var SOCKET_LIST = []; 	
var PLAYER_LIST = [];	// str name, int host, int score
var GAME_LIST = [];		// str name, int numPlayers, str gamePassword, bool started

// Generate a list of public games every 5 seconds
var publicGames;
setInterval(function() {
		publicGames = "List of Public Games: </div><div>";
		for(var i in GAME_LIST){
			if (GAME_LIST[i].started == false) // Waiting to start
				if (GAME_LIST[i].gamePassword === "") //No password
					if(GAME_LIST[i].numPlayers < MAX_GAME_PLAYERS) // Isn't full
						publicGames += GAME_LIST[i].name + "</div><div>";
		}
}, 3000);


io.sockets.on('connection', function(socket){
	//If lobby is full
	if (numberOfPlayers >= MAX_SERVER_PLAYERS){
		socket.emit('lobbyFull');
		console.log("Lobby full error");
		socket.disconnect();
		return;
	}
	socket.id = Math.floor(Math.random()*MAX_SERVER_PLAYERS);
	// Register Socket upon Connection
	while (SOCKET_LIST[socket.id] != null){//Generate a random socket id for each new connection
		socket.id++;
	}		
	SOCKET_LIST[socket.id] = socket;
	numberOfPlayers++; 
	
	// When user disconnects
	socket.on('disconnect',function(){
		disconnectUser(socket);
		numberOfPlayers--; 
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
			socket.emit('createGameResponse',{success:true, chat:CHAT, universal:UNIVERSAL_CHAT, controls:TRACK_CONTROLS, wasd:INCLUDE_WASD});
		}		
	});
	
	// Joining a Game
	socket.on('joinGame',function(name, gamePassword){
		var i = findGame(name);
		if (i==-1){ // If game doesn't exist
				socket.emit('joinGameResponse',{success:false, gameExist:false});
		} else { // If game exists
			if(GAME_LIST[i].gamePassword === gamePassword){
				if(GAME_LIST[i].numPlayers < MAX_GAME_PLAYERS){
					if(GAME_LIST[i].started){
						socket.emit('joinGameResponse',{success:false, started:true});
					} else{
						joinGame(socket, i);
						socket.emit('joinGameResponse',{success:true, chat:CHAT, universal:UNIVERSAL_CHAT, controls:TRACK_CONTROLS, wasd:INCLUDE_WASD});
					}
				} else
					socket.emit('joinGameResponse', {success: false, gameFull:true});
			} else 
				socket.emit('joinGameResponse',{success:false, gameExist:true});
		}		
	});
	
	//	Universal Chat
	socket.on('sendMsgToServer',function(data){ // When user sends a message
		for(var i in SOCKET_LIST){
			var str = PLAYER_LIST[socket.id].name + ': ' + data;
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});
	
	//	In-game Chat
	socket.on('sendMsgToGame',function(data){ // When user sends a message
		for(var i in PLAYER_LIST){
			if (PLAYER_LIST[socket.id].host==PLAYER_LIST[i].host){
				var str = PLAYER_LIST[socket.id].name + ': ' + data;
				SOCKET_LIST[i].emit('addToGame',str);
			}
		}
	});
	
	/*
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
	*/
	
	
//---------------------------------------------
//			CARDS AGAINST HUMANITY
//---------------------------------------------
	
	// Read in a deck of answer cards
	
	
	// When a user plays a card
	socket.on('playedCard', function(data){
		for(var i in PLAYER_LIST){
			if (PLAYER_LIST[socket.id].host==PLAYER_LIST[i].host){
				var str = PLAYER_LIST[socket.id].name + ' played the card: ' + data;
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
		var str = "";
		for (var i in PLAYER_LIST){
			if (PLAYER_LIST[id].host === PLAYER_LIST[i].host){
				str += (PLAYER_LIST[id].name + "'s score is: " + PLAYER_LIST[i].score + "<br>");
			}
		}
		socket.emit('updateScores', str);
	}
	
	// Start Game (host)
	socket.on('startGame', function(){
		if (GAME_LIST[socket.id].numPlayers >= MIN_GAME_PLAYERS){
			startGame(socket.id);
		setTimeout(function(){
			updateScores(socket.id)
		}, 3000);
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
				for(var i in PLAYER_LIST){ // End game that player has disconnected from
					if (PLAYER_LIST[socket.id].host==PLAYER_LIST[i].host){
						var str = PLAYER_LIST[socket.id].name;
						SOCKET_LIST[i].emit('endOfGame',str);
					}
				}
			} else {
				for(var i in PLAYER_LIST){ // Tell other players in game that user has disconnected
					if (PLAYER_LIST[socket.id].host==PLAYER_LIST[i].host){
						var str = PLAYER_LIST[socket.id].name + ": has disconnected";
						GAME_LIST[PLAYER_LIST[socket.id].host].numPlayers--;
						SOCKET_LIST[i].emit('addToGame',str);
					}
				}
			}
		}
	}	
	
	//Remove game from GAME_LIST when the host disconnects
	if (PLAYER_LIST[socket.id].host == socket.id) delete GAME_LIST[socket.id];
	
	// Remove player from PLAYER_LIST on disconnect
	delete PLAYER_LIST[socket.id];
	delete SOCKET_LIST[socket.id];
}

isUsernameTaken= function(name){
	for (var i in PLAYER_LIST) // Check if  name is already taken
		if (PLAYER_LIST[i].name === name)
			return true;
	return false;
}

addUser = function(name, socket){
	PLAYER_LIST[socket.id] = {name: name, score: 0};
}

findGame = function(name){
	for (var i in GAME_LIST)
	if (GAME_LIST[i].name == name){
			return i;
		}
	return -1;	
}

createGame = function(name, socket, gamePassword){
	GAME_LIST[socket.id]= {name:name, gamePassword:gamePassword, numPlayers:1, started:false};
	PLAYER_LIST[socket.id].host = socket.id;
	socket.emit('hosting');
}

joinGame = function(socket, host){
	PLAYER_LIST[socket.id].host = host;
	GAME_LIST[host].numPlayers++;
	if (CHAT)
		for (var i in PLAYER_LIST)
			if (PLAYER_LIST[i].host == host){
				var str = PLAYER_LIST[socket.id].name + ' has connected to the game';
				SOCKET_LIST[i].emit('addToGame',str);
			}
}

startGame = function(host){
	GAME_LIST[host].started = true;
	for (var i in PLAYER_LIST)
		if (PLAYER_LIST[i].host == host)
			SOCKET_LIST[i].emit('startGame');
}

//---------------------------------------------
//				CONTROLS
//---------------------------------------------
/*
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
*/