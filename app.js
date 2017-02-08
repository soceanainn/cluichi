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
	do {//Generate a random socket id for each new connection
		socket.id = Math.floor(Math.random()*numofPlayers);
	} while (SOCKET_LIST[socket.id] != null)
		
	SOCKET_LIST[socket.id] = socket;
	
	socket.on('signIn',function(username){ // When user tries to sign in
		if (isUsernameTaken(username)){
				socket.emit('signInResponse',{success:false});		
		} else { // If username is free add user
			addUser(username, socket);
			socket.emit('signInResponse',{success:true});
		}		
	});
	
	socket.on('sendMsgToServer',function(data){ // When user sends a message
		for(var i in SOCKET_LIST){
			var str = playerList[socket.id] + ': ' + data;
			console.log(str);
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});

	socket.on('disconnect',function(){ // When a user disconnects 
		disconnectUser(socket);
	});
});

function isUsernameTaken(name){
	if (playerList.indexOf(name)==-1) return(false);
	else return(true);
}
function addUser(name, socket){
	playerList[socket.id] = name;
}

function disconnectUser(socket){
	delete playerList[socket.id];
	delete SOCKET_LIST[socket.id]; 
}