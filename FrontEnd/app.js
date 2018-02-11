var express = require('express');
var app = express();
var path = require('path');
var ws = require("nodejs-websocket")

var voiceCommandLibrary = require('./voiceCommands');
console.log(voiceCommandLibrary);

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "GUI"));

var server = require('http').createServer(app);

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

server.listen(3000, () => console.log('running on 3000'));

var wsServer = ws.createServer(function (conn) {
	console.log("New connection")
	var sentData = "";
	conn.on("text", function (str) {
		console.log("Received "+str)
		sentData = str;
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
		sendData(sentData)
	})
 }).listen(8080)

function sendData(data) {
	console.log(wsServer.connections);
	wsServer.connections.forEach( (conn) => {
		conn.send(data);
	});
}

app.get('/', (req,res) => {
	res.render("main");
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

app.get('/nav/:command', (req, res) => {
	console.log('getting param: ' + req.params.command);
	switch(req.params.command) {
		case "give me the weather":
			res.render("weather");
		default:
			res.render("main");
	}
});


app.post('/send', (req, res) => {
	console.log(req.body);
});
