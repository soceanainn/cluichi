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

// Keep track of sockets and players usernames in use
var SOCKET_LIST = [];
var playerList = [];

io.sockets.on('connection', function(socket){
	// Register Socket upon Connection
	do {//Generate a random socket id for each new connection
		socket.id = Math.floor(Math.random()*numofPlayers);
	} while (SOCKET_LIST[socket.id] != null)		
	SOCKET_LIST[socket.id] = socket;
	
	// When user disconnects
	socket.on('disconnect',function(){ // When a user disconnects 
		disconnectUser(socket);
	});
	
	// User Sign In
	socket.on('signIn',function(username){ // When user tries to sign in
		if (isUsernameTaken(username)){
				socket.emit('signInResponse',{success:false});		
		} else { // If username is free add user
			addUser(username, socket);
			socket.emit('signInResponse',{success:true});
		}		
	});
	
	//	Chat Functionality
	socket.on('sendMsgToServer',function(data){ // When user sends a message
		for(var i in SOCKET_LIST){
			var str = playerList[socket.id] + ': ' + data;
			console.log(str);
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});
	
	// Key Presses for controls
	socket.on('keyPress', function(data){ //When a user presses a key
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

isUsernameTaken= function(name){
	if (playerList.indexOf(name)==-1) return(false);
	else return(true);
}

addUser = function(name, socket){
	playerList[socket.id] = name;
}

disconnectUser = function (socket){
	delete playerList[socket.id];
	delete SOCKET_LIST[socket.id]; 
}

//---------------------------------------------
//				CONTROLS
//---------------------------------------------

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
}