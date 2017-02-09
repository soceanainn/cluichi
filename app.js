//----------------------------------------------
// 			Set Up Express
//---------------------------------------------- 
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

//-----------------------------------------------------
// 				Set Up Socket.io and Players
//-----------------------------------------------------

var io = require('socket.io')(serv,{});

// Constant for number of sockets (players) allowed at a time
var numofPlayers = 100;

// Keep track of sockets, players usernames, and game names in use
var SOCKET_LIST = [];
var PLAYER_LIST = [];
var GAME_LIST = [];

io.sockets.on('connection', function(socket){
	// Register Socket upon Connection
	do {//Generate a random socket id for each new connection
		socket.id = Math.floor(Math.random()*numofPlayers);
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
	
	// Game Creation
	socket.on('createGame',function(name){
		if (findGame(name)!=-1){
				socket.emit('createGameResponse',{success:false});		
		} else { // If game name is free add game to list
			createGame(name, socket);
			socket.emit('createGameResponse',{success:true});
		}		
	});
	
	// Joining a Game
	socket.on('joinGame',function(name){
		if (findGame(name)==-1){
				socket.emit('joinGameResponse',{success:false});		
		} else { // If game name is free add game to list
			joinGame(name, socket);
			socket.emit('joinGameResponse',{success:true});
		}		
	});
	
	//	Chat Functionality
	socket.on('sendMsgToServer',function(data){ // When user sends a message
		for(var i in SOCKET_LIST){
			var str = PLAYER_LIST[socket.id] + ': ' + data;
			console.log(str);
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});
	
	// Key Presses for controls
	socket.on('keyPress', function(data){
		if (data.inputId === 'right'){
			rightClick(data.state);
		}
		else if (data.inputId === 'down'){
			downClick(data.state);
		}
		else if (data.inputId === 'left'){
			leftClick(data.state);
		}
		else if (data.inputId === 'up'){
			upClick(data.state);
		}
	});
	
	// Track mouse for controls
	var mousePosition;
	socket.on('mouseEvent', function(data){
		if (data.inputId==='mousePosition'){
			mousePosition = mousePosition.state;
		}
		
		else if (data.inputId==='mouseClick'){
			mouseClick(data.state, mousePosition);
		}
	});
});

disconnectUser = function (socket){
	delete PLAYER_LIST[socket.id];
	delete SOCKET_LIST[socket.id]; 
}

isUsernameTaken= function(name){
	if (PLAYER_LIST.indexOf(name)==-1) return(false);
	else return(true);
}

addUser = function(name, socket){
	PLAYER_LIST[socket.id] = name;
}

findGame = function(name){
	return GAME_LIST.indexOf(name);
}

createGame = function(name, socket){
	GAME_LIST[socket.id] = name;
}

joinGame = function(name, socket){
	GAME_LIST[socket.id] = name;
}

//---------------------------------------------
//				CONTROLS
//---------------------------------------------
/*
upClick = function(pressed){
	if(pressed) // Up key is pressed
}

downClick = function(pressed){
	if(pressed) // Down key is pressed
}

leftClick = function(pressed){
	if(pressed) // Left key is pressed
}

rightClick = function(pressed){
	if(pressed) // Right key is pressed
}

mouseClick = function(pressed, position){
	var x = position.x;
	var y = position.y;
}*/