var express = require('express');
var app = express();
var server = require('http').createServer(app);

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// var io = require('socket.io').listen(server);

//var WebSocketClient = require('websocket').client;
//var client = new WebSocketClient();
/*
client.on('connectFailed', (error) => {
	console.log('fail error: ' + error);
});

client.on('connection', (connection) => {
	console.log('connected!');
	client.on('error', (error) => {
		console.log('error after connection: ' + error);
	});
	client.on('close', (error) => {
		console.log('closing: ' + error);
	});
	client.on('message', (error) => {
		console.log('msg: ' + error);
	});
});

client.connect('ws://localhost:2200/', 'echo-protocol');
*/






server.listen(3000, () => console.log('running on 3000'));


var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false


});


function originIsAllowed(origin) {
	return true;
}

wsServer.on('request', function(request) {
	var connection = request.accept('echo-protocol', request.origin);
	console.log('Connection accepted');
	connection.on('message', (message) => {
		console.log(message);
		if (message.type === 'utf8') {
			console.log(message.utf8Data);
		}
	});
});

app.get('/', (req,res) => {
	res.send('gogogo');
});

app.post('/send', (req, res) => {
	console.log(req.body);
});

/*
io.sockets.on('connection', function(socket) {
	console.log('connecting to socket');
	io.sockets.on('datasend', function(data) {
		console.log(data);
	});

});
*/