// Imports
var express = require('express');
var app = express();
var path = require('path');
var ws = require("nodejs-websocket")
var bodyParser = require('body-parser')
var server = require('http').createServer(app);

var Config = require('./config');
var voiceCommandLibrary = require('./voiceCommands');
var CommandParser = require('./commandParser');

var CmdParser = CommandParser.initCommandParser(voiceCommandLibrary);

// App Configuration
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "GUI"));

// Next two lines for abolity to grab Body from a POST request, possibly unneeded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Start the GUI Server
server.listen(Config.guiServerPort, () => console.log('running on 3000'));

// Configure the Websocket Server
var wsServer = ws.createServer(function (conn) {
	console.log("New connection")
	var sentData = "";
	conn.on("text", function (str) {
		console.log("Received "+str)
		sentData = str;
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
		// wait until python connection closes before sending the text input to the client
		sendData(sentData)
	})
 }).listen(Config.websocketServerPort)

// Web Socket method, sends data to all server connections (currently used to bounce python speech input down to the client)
function sendData(data) {
	wsServer.connections.forEach((conn) => {
		conn.send(data);
	});
}


// Routes

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

// main route for all voice commands
app.get('/nav/:command', (req, res) => {
	let commandData = CmdParser.getCommandForString(req.params.command);
	let paramData = voiceCommandLibrary.commands[commandData.commandIndex].trigger(commandData.param);
	res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
});
