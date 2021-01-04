//----------------------------------------------
// 			Set Up Express and Server
//----------------------------------------------
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
const preab = require('./game-server/preab.js')(io);

server.listen(process.env.PORT || 2000);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html')
});

app.get('/preab', function(req, res) {
	res.sendFile(__dirname + '/client/preab/index.html')
});

app.get('/cartai',function(req, res) {
	res.sendFile(__dirname + '/client/CartaiVsDaonnachta/index.html')
});

app.get('/boggle', function(req, res) {
	res.sendFile(__dirname + '/client/boggle/index.html')
});

app.get('/risk', function(req, res) {
	res.sendFile(__dirname + '/client/risk/index.html')
});

app.get('/ris', function(req, res) {
	res.sendFile(__dirname + '/client/ris/index.html')
});

app.get('/eolas', function(req, res) {
	res.sendFile(__dirname + '/client/about.html')
});

app.get('/sitemap.xml', function(req, res) {
	res.sendFile(__dirname + '/sitemap.xml')
});

app.use('/client',express.static(__dirname + '/client'));
app.use('/scealta',express.static(__dirname + '/scealta'));

const lsg = require('./lsg/lsg.js');
app.get('/api/lsg/:id', function(req, res){
	let depth = 1;
	if(req.query.depth !== null) depth = req.query.depth;
	if (depth > 3) depth = 3;
	else if (depth < 1) depth = 1;
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/json');
	res.status(200).json(lsg.fetchGraph(req.params.id, depth));
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
	res.status(404).sendFile(__dirname + '/client/not-found.html');
});

console.log("Server started.");
