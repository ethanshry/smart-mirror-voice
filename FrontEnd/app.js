var express = require('express');
var app = express();
var path = require('path');
app.set("view engine", "pug");

app.set("views", path.join(__dirname, "GUI"));

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

/*
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
*/
app.get('/', (req,res) => {
	res.send('gogogo');
});


app.get('/PugDemo', (req, res) => {
	const params = {
		params: {
			pageName: "Demo Page",
			user: "tim",
			storeItems: [
				{
					name: "fish",
					cost: "4.99"
				},
				{
					name: "walrus statue",
					cost: "7.77"
				},
				{
					name: "tiger plushie",
					cost: "3.76"
				},
				{
					name: "tomatoes",
					cost: "4.99/lb"
				}
			]
		}
	}
	res.render("pugDemo", params);
});


app.get('/KevinDemo', (req, res) => {
	const params = {
		params: {
			pageName: "Kevin's Page",
			numbers: [1,3,17,55,23,91],
			isAuthenticated: 'true',
			objects: [
				{
					name: "tim",
					gender: "male"
				},
				{
					name: "tina",
					gender: "female"
				},
				{
					name: "tommy",
					gender: "male"
				},
				{
					name: "trisha",
					gender: "female"
				}
			]
		}
	}
	res.render("kevinDemo", params);
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