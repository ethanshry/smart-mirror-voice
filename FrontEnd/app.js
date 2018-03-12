// Imports
let express = require('express');
let app = express();
let path = require('path');
let ws = require("nodejs-websocket")
let bodyParser = require('body-parser')
let server = require('http').createServer(app);

let request = require('request');
let twitterAPI = require('twitter');

let fs = require('fs');

let Config = require('./config');
let voiceCommandLibrary = require('./voiceCommands');
let CommandParser = require('./commandParser');

let CmdParser = CommandParser.initCommandParser(voiceCommandLibrary);

// App Configuration
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "GUI"));

// Next two lines for abolity to grab Body from a POST request, possibly unneeded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// global content store
const globalData = {
	audioAwaitingOutput: ""
};

// Start the GUI Server
server.listen(Config.guiServerPort, () => console.log('running on 3000'));

// Configure the Websocket Server
let wsServer = ws.createServer(function (conn) {
	console.log("New connection")
	// var sentData = "";
	conn.on("text", function (str) {
		console.log("Received "+str)
		// sentData = str;
		const newData = processRecievedWebsocketData(sentData);
		if (newData.cmd == 'audiooutrequest') {
			// audiooutrequest should return an audiooutresponse
			if (globalData.audioAwaitingOutput != "") {
				sendData(formatOutgoingWebsocketData('audiooutresponse', globalData.audioAwaitingOutput));
				globalData.audioAwaitingOutput = "";
			} else {
				sendData(formatOutgoingWebsocketData('audiooutresponse', 'noresponse'));
			}
		} else if (newData.cmd == 'clientpassthrough') {
			// client only expects page requests, clientpassthrough should return pageselectrequest
			sendData(formatOutgoingWebsocketData('pageselectrequest', newData.packet));
		} else if (newData.cmd == 'lightrequest') {
			// ###TODO: Complete arduino integration
		}
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
		// wait until python connection closes before sending the text input to the client
		//sendData(sentData);
	})
 }).listen(Config.websocketServerPort)

// Web Socket method, sends data to all server connections (currently used to bounce python speech input down to the client)
function sendData(data) {
	wsServer.connections.forEach((conn) => {
		conn.send(data);
	});
}

function processRecievedWebsocketData(data) {
	
	const startSeqIndex = data.indexOf('~-~');
	const endSeqIndex = data.indexOf('~.~');
	const termSeqIndex = data.indexOf('~_~');
	let cmd = data.substring(startSeqIndex + 3, endSeqIndex);
	let packet = data.substring(endSeqIndex + 3, termSeqIndex);
	return {
		cmd: cmd,
		packet: packet
	}
}

function formatOutgoingWebsocketData(cmd, packet) {
	return "~-~" + cmd + "~.~" + packet + "~_~";
}
/*
function sendHardwareInterfaceMessage(message) {
	const conn = ws.connect('ws://localhost:9393');
	conn.send(message);
}*/


// ### Routes ###

app.get('/', (req,res) => {
	res.render("main");
});

// main route for all voice commands
app.get('/nav/:command', (req, res) => {
	// reqrite to pass cmd string and cmd param (optional)
	let commandData = CmdParser.getCommandForString(req.params.command);
	if (commandData.commandIndex == -1) {
		res.render("error");
	} else {
		let paramData = voiceCommandLibrary.commands[commandData.commandIndex].trigger(commandData.param);
		res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
	}
});

app.get('/api/:test', (req, res) => {
	console.log(req.params.test);
	switch (req.params.test) {
		case 'weather':
			let requestString = Config.APIStrings.openweathermap.replace('%?%', Config.APIKeys.openweathermap);
			console.log(requestString);
			let responseData = {
				"condition": null,
				"temperature": null,
				"humidity": null,
				"wind": null,
				"windDirection": null
			};
			request(requestString, (err, response, body) => {
				body = JSON.parse(body);
				responseData.condition = body.weather[0].main;
				responseData.temperature = Math.round((9/5 * body.main.temp - 273.15) + 32);
				responseData.humidity = body.main.humidity;
				responseData.wind = body.wind.speed;
				responseData.windDirection = "N";
				console.log(responseData);
			});
			break;
		case 'twitter':
			let caller = new twitterAPI({
				consumer_key: Config.APIKeys.twitter.consumerKey,
				consumer_secret: Config.APIKeys.twitter.consumerSecret,
				access_token_key: Config.APIKeys.twitter.accessToken,
				access_token_secret: Config.APIKeys.twitter.accessTokenSecret
			});
			caller.get('search/tweets', {q: 'victory'}, (error, tweets, response) => {
				tweets.statuses.forEach((tweet, index) => {
					tweets.statuses[index] = {
						text: tweet.text,
						timestamp: tweet.created_at,
						user: tweet.user
					}
				});
				console.log(tweets);
			});
			break;
		default:
			break;
	}
	res.render('error');
});
