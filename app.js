var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};
function Player (username, id){
	this.username = username;
	this.id = id;
}
playerList = [];
Player.onConnect = function(socket,username){
	var player = Player({
		username:username,
		id:socket.id,
	});/*
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	
	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	
	socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});*/
}

Player.onDisconnect = function(socket){
	delete playerList[socket];
	
}

function isUsernameTaken(name){
	if (playerList.indexOf(name)==-1) return(false);
	else return(true);
}
function addUser(name, socket){
	playerList[socket] = name;
}

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	socket.on('signIn',function(username){
		if (isUsernameTaken(username)){
				socket.emit('signInResponse',{success:false});		
		} else {
			addUser(username, socket);
			socket.emit('signInResponse',{success:true});					
		}		
	});
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});

setInterval(function(){
	var pack = {
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		//socket.emit('init',initPack);
	}
},1000/25);







