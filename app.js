//----------------------------------------------
// 			CONSTANTS
//---------------------------------------------- 

let MAX_SERVER_PLAYERS = 100; 			// Number of players allowed on server at one time
let MAX_GAME_PLAYERS = 5; 				// Number of players allowed in each game at a time
let MIN_GAME_PLAYERS = 3; 				// Number of players needed to start the game

let CHAT = true;						// Display chat underneath game
let UNIVERSAL_CHAT = true;				// Allow players to select universal chat

let TRACK_CONTROLS = false;				// Capture key press events
let INCLUDE_WASD = false;				// Allow WASD to be used as arrow keys

//----------------------------------------------
// 			Set Up Express and Server
//---------------------------------------------- 
let express = require('express');
let app = express();
let server = require('http').Server(app);

server.listen(process.env.PORT || 2000);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html')
});

app.get('/cartai',function(req, res) {
	res.sendFile(__dirname + '/client/CartaiVsDaonnachta/index.html')
});

app.use('/client',express.static(__dirname + '/client'));
console.log("Server started.");

//-----------------------------------------------------
// 				Set Up Sockets, Players and Game
//-----------------------------------------------------

let io = require('socket.io')(server);
let numberOfPlayers = 0; //Number of players in lobby

// Keep track of sockets, players usernames,games, and scores in use
let SOCKET_LIST = []; 	
let PLAYER_LIST = [];	// str name, int host, int score
let GAME_LIST = [];		// str name, int numPlayers, str gamePassword, bool started

// Generate a list of public games every 5 seconds
let publicGames;
setInterval(function() {
		publicGames = "Liosta na gCluichí Poiblí: </div><div>";
		for(let i in GAME_LIST){
			if (GAME_LIST[i].started === false) // Waiting to start
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
		if (findGame(name) !== -1){
				socket.emit('createGameResponse',{success:false});		
		} else { // If game name is free join game as first users
			createGame(name, socket, gamePassword);
			socket.emit('createGameResponse',{success:true, chat:CHAT, universal:UNIVERSAL_CHAT, controls:TRACK_CONTROLS, wasd:INCLUDE_WASD});
		}		
	});
	
	// Joining a Game
	socket.on('joinGame',function(name, gamePassword){
		let i = findGame(name);
		if (i === -1){ // If game doesn't exist
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
		for(let i in SOCKET_LIST){
			let str = PLAYER_LIST[socket.id].name + ': ' + data;
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});
	
	//	In-game Chat
	socket.on('sendMsgToGame',function(data){ // When user sends a message
		for(let i in PLAYER_LIST){
			if (PLAYER_LIST[socket.id].host === PLAYER_LIST[i].host){
				let str = PLAYER_LIST[socket.id].name + ': ' + data;
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
