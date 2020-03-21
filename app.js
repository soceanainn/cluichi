import { fetchGraph } from '/lsg/lsg.mjs';
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

app.get('/api/lsg/:id', function(req, res){
	let depth = 0;
	if(req.query.depth !== null) depth = req.query.depth;
	if (depth > 5) depth = 5;
	res.status(200).send(fetchGraph(req.params.id, depth))
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
	res.status(404).sendFile(__dirname + '/client/not-found.html');
});


console.log("Server started.");
