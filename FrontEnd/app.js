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

function testPy() {
	let PythonShell = require('python-shell');
	let testPy = new PythonShell('./test.py');
	console.log('3');
	testPy.on('message', (msg) => {
		console.log('4');
		console.log('Recieving Rekognition Data: ' + msg);
	});
	testPy.end(() => {
		console.log('5');
		console.log("Closing Camera Session");
	});
}

testPy();

// global content store
const globalData = {
	activeUser: "default",
	// start true so will update hotwords ASAP
	shouldUpdateUser: true,
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
		console.log("hardware" in paramData);
		// let p = new Promise();
		if (paramData instanceof Promise) {
			console.log('in the promise');
			paramData.then((pData) => {
				console.log(pData);
				throw "Woahhhh chill";
				if ("error" in paramData) {
					res.render('textDisplay', {params: { text: paramData.error}});
				} else {
					if ("audioOptions" in paramData.params && paramData.params.audioOptions.shouldOutput) {
						globalData.audioAwaitingOutput = paramData.params[paramData.params.audioOptions.property];
					}
					console.log("audio:" + globalData.audioAwaitingOutput);
					res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
				}
			});
		} else if ("error" in paramData) {
			res.render('textDisplay', {params: { text: paramData.error}});
		} else if ("hardware" in paramData.params) {
			console.log('1');
			if (paramData.params.hardware == "switchUser") {
				console.log('2');
				checkForUserThroughFacialRecognition();
			} /*else if (paramData["hardware"] == "activeStatus") {
				checkForUserThroughFacialRecognition();
			}*/
			res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
		} else {
			if ("audioOptions" in paramData.params && paramData.params.audioOptions.shouldOutput) {
				globalData.audioAwaitingOutput = paramData.params[paramData.params.audioOptions.property];
			}
			console.log("audio:" + globalData.audioAwaitingOutput);
			res.render(voiceCommandLibrary.commands[commandData.commandIndex].viewName, paramData);
		}
	}
});

/*
	### Serial Communication ###
*/

let sp = new SerialPort("/dev/ttyAMA0", {
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
	// let bufferedData = new Buffer(data, 'utf');
	let bufferedData = data.toString('utf-8');
	console.log("Recieved Serial Data: " + bufferedData);
	globalData.serialACK = 1;
});

//ititialize leds to blank
sp.write("0");

// USED TO WRITE TO SERIAL WITH PARAMS ONLY
// Note we expect "ACK" back from sending the mode and "K" back from each parameter, but we don't care that much so we're not going to check this
async function writeSerial(serialSends) {
	for (let i = 0; i < serialSends.length; i++) {
		globalData.serialACK = 0;
		sp.write(serialSends[i]);
		while (!serialACK) {
			await sleep(10);
		}
	}
}

// sexy async js
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/*
	### Faical Recognition Methods ###
*/

// I hate so much that im actually writing this method right now send help I feel like a bad developer
function checkForUserThroughFacialRecognition() {
	let PythonShell = require('python-shell');
	let testPy = new PythonShell('./facial-rec.py');
	console.log('3');
	testPy.on('message', (msg) => {
		console.log('4');
		console.log('Recieving Rekognition Data: ' + msg);
		let dataPoints = msg.split(',');
		for (let i = 0; i < dataPoints.length; i++) {
			let params = dataPoints[0].split(':');
			if (params[0] == "faceDetected" && params[1] == "false") {
				// no face detected, should say so
				globalData.audioAwaitingOutput = "Sorry, we could not detect a face in view of the camera";
			}
			if (params[0] == "user" && params[1] != "undefined") {
				// user is found! (in theory)
				changeUser(params[1]);
			} else {
				//user is undefined
				globalData.audioAwaitingOutput = "Sorry, the user was not found in the image database";
			}
		}
	});
	testPy.end(() => {
		console.log("Closing Camera Session");
	});
}

/*
	### Utility Methods ###
*/
/*
	LIGHT INFO:
		Modes:
			0 = off
			1 = Breathing (requires params)
			2 = Spiral Up
			3 = Solid On (requires params)
			4 = Fire
			5 = Spasmy
			6 = Breathe Blue
			7 = Breahe Green
			8 = Breathe Red
			9 = Spiral Blue
			10 = Spiral Red
			11 = Spiral Green
	params are: r,g,b,frame delay
*/

function sendLightSignal(signalKey) {
	switch (signalKey.toLowerCase()) {
		case 'clear':
			sp.write("0");
			break;
		case 'hotwordtriggered':
			sp.write("9");
			break;
		case 'thinking':
			sp.write("6");
			break;
		default:
			// confused signal
			console.log('Trying to send light signal with unknown code, code: ' + signalKey.toLowerCase());
			break;
	}
}

function changeUser(user) {
	let content = JSON.parse(fs.readFileSync('./userData.json'));
	globalData.activeUser = content.users.indexOf(user.toLowerCase()) != -1 ? user : "default";
	globalData.audioAwaitingOutput = "switching user to " + globalData.activeUser;
}