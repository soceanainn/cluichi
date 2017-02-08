var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = [];
var playerList = [];

disconnectUser = function(socket){
	delete playerList[socket.id];
}

function isUsernameTaken(name){
	if (playerList.indexOf(name)==-1) return(false);
	else return(true);
}
function addUser(name, socket){
	playerList[socket.id] = name;
}

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	socket.id = Math.floor(Math.random()*100);
	SOCKET_LIST[socket.id] = socket;
	
	socket.on('signIn',function(username){
		if (isUsernameTaken(username)){
				socket.emit('signInResponse',{success:false});		
		} else {
			addUser(username, socket);
			socket.emit('signInResponse',{success:true});
		}		
	});
	
	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			var str = playerList[socket.id] + ': ' + data;
			console.log(str);
			SOCKET_LIST[i].emit('addToChat',str);
		}
	});

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		disconnectUser(socket);
	});
});