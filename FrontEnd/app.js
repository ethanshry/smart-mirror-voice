/*
    app.js

    Last Updated- EthanShry 20180321

    Main js file- handles HTTP Server, Websocket Server, Serial Communication...

*/

// Server Imports
let express = require('express');
let app = express();
let path = require('path');
let ws = require("nodejs-websocket")
let bodyParser = require('body-parser')
let server = require('http').createServer(app);

// Hardware Interface Imports
let SerialPort = require('serialport');

//API Imports
let request = require('request');
let twitterAPI = require('twitter');

// File System Imports
let fs = require('fs');

//Local File imports
let Config = require('./config');
let voiceCommandLibrary = require('./voiceCommands');
let CommandParser = require('./commandParser');

// Initialize Command Parser from local command library
let CmdParser = CommandParser.initCommandParser(voiceCommandLibrary);

// App Configuration
app.set("view engine", "pug");
app.set("views", path.resolve(__dirname,'GUI'));

// Next two lines for abolity to grab Body from a POST request, possibly unneeded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// global content store
const globalData = {
	activeUser: "ethan",
	shouldUpdateUser: false,
	mirrorIsActive: true,
	audioAwaitingOutput: "",
	serialACK: 0
};

// Start the GUI Server
server.listen(Config.guiServerPort, () => console.log('running on 3000'));

/*
	### Websocket Server ###
*/
let wsServer = ws.createServer(function (conn) {
	console.log("New connection")
	// var sentData = "";
	conn.on("text", function (str) {
		console.log("Received "+str)
		// sentData = str;
		const newData = processRecievedWebsocketData(str);
		switch(newData.cmd) {
			case 'audiooutrequest':
				// audiooutrequest should return an audiooutresponse
				if (globalData.audioAwaitingOutput != "") {
					sendData(formatOutgoingWebsocketData('audiooutresponse', globalData.audioAwaitingOutput));
					globalData.audioAwaitingOutput = "";
				} else {
					sendData(formatOutgoingWebsocketData('audiooutresponse', 'noresponse'));
				}
				break;

			case 'clientpassthrough':
				// client only expects page requests, clientpassthrough should return pageselectrequest
				sendData(formatOutgoingWebsocketData('pageselectrequest', newData.packet));
				break;

			case 'lightrequest':
				// ###TODO: Complete arduino integration
				sendLightSignal(newData.packet);
				break;

			case 'shouldswitchuserrequest':
				// shouldswitchuserrequest should return an shouldswitchuserresponse
				// expects noswitch if not active, username:hotwordA,hotwordB,... if active
				if (globalData.shouldUpdateUser) {
					globalData.shouldUpdateUser = false;
					let content = JSON.parse(fs.readFileSync('./userData.json'));
					let userString = globalData.activeUser + ':' + content.users[globalData.activeUser].hotwords.join(',');
					sendData(formatOutgoingWebsocketData('shouldswitchuserresponse', userString));
				} else {
					sendData(formatOutgoingWebsocketData('shouldswitchuserresponse', 'noswitch'));
				}
				break;

			case 'activestatusrequest':
				// activestatusrequest should return an activestatusresponse
				// expects n if not active, anything else if active
				if (globalData.mirrorIsActive) {
					sendData(formatOutgoingWebsocketData('activestatusresponse', 'y'));
				} else {
					sendData(formatOutgoingWebsocketData('activestatusresponse', 'n'));
				}
				break;
		}
	})
	conn.on("close", function (code, reason) {
		console.log("Connection closed")
		// wait until python connection closes before sending the text input to the client
		//sendData(sentData);
	})
	conn.on("error", function (err) {
		// MUST INCLUDE so that the socket server doesnt crash all the time
		// see https://github.com/websockets/ws/issues/1256 for details
		// Also will sporadically call for no apparent reason with no impact- just ignore it
		console.log('erroring out');
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
	### Routes ### (Main NPM Server)
*/

app.get('/', (req,res) => {
	res.render("main");
});

// main route for all voice commands
app.get('/nav/:cmd', (req, res) => {
	console.log('naving');
	// reqrite to pass cmd string and cmd param (optional)
	console.log(req.params.cmd);
	const commandData = CmdParser.getCommandForString(req.params.cmd);
	console.log(commandData);
	if (commandData.commandIndex == -1) {
		res.render("error");
	} else {
		let paramData = voiceCommandLibrary.commands[commandData.commandIndex].trigger(commandData.param, globalData.activeUser);
		console.log(paramData);
		if ("error" in paramData) {
			res.render('textView', {params: { text: paramData.error}});
		} else {
			if ("audioOptions" in paramData.params && paramData.params.audioOptions.shouldOutput) {
				globalData.audioAwaitingOutput = paramData.params[paramData.params.audioOptions.property];
			}
			console.log("audio:" + globalData.audioAwaitingOutput);
			res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
		}
	}
	//res.render('error');
});

/*
	### Serial Communication ###
*/

let sp = new SerialPort("/dev/ttyACM0", {
	baudRate: 115200
});

sp.on("open", () => {
	console.log("Serial Comm Connection Open");
});

sp.on("error", (error) => {
	console.error("Serial Comm Error: ", error);
});

sp.on("close", () => {
	console.log("Serial Comm Port Closed");
});

sp.on("data", (data) => {
	let bufferedData = new Buffer(data, 'utf');
	console.log("Recieved Serial Data: " + bufferedData);
	globalData.serialACK = 1;
});

async function writeSerial(serialSends) {
	for (let i = 0; i < serialSends.length; i++) {
		globalData.serialACK = 0;
		sp.write(serialSends[i]);
		while (!serialACK) {
			await sleep(100);
		}
	}
}

// sexy async js
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/*
	### Utility Methods ###
*/

function sendLightSignal(signalKey) {
	switch (signalKey.lower()) {
		case 'clear':
			break;
		case 'hotwordtriggered':
			break;
		case 'thinking':
			break;
		default:
			// confused signal
			console.log('Trying to send light signal with unknown code, code: ' + signalKey.lower());
			break;
	}
}

// ###TODO: Remove from final project
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
