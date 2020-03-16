//-------------------0--------------------------
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

app.get('/eolas', function(req, res) {
	res.sendFile(__dirname + '/client/about.html')
});

app.get('/sitemap.xml', function(req, res) {
	res.sendFile(__dirname + '/sitemap.xml')
});

app.use('/client',express.static(__dirname + '/client'));
app.use('/scealta',express.static(__dirname + '/scealta'));
console.log("Server started.");
