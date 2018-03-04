// Imports
let express = require('express');
let app = express();
let path = require('path');
let ws = require("nodejs-websocket")
let bodyParser = require('body-parser')
let server = require('http').createServer(app);

let request = require('request');
let twitterAPI = require('twitter');

let cheerio = require('cheerio');

let fs = require('fs');

const wikiQueries = ["lebron james", "watermellon", "fish", "pasta", "italy"];
for (let item in wikiQueries) {
	console.log("scraping wikipedia for information on '" + wikiQueries[item] + "'...");
	const queryString = "https://en.wikipedia.org/wiki/" + wikiQueries[item].replace("/ /g ", "_");
	request(queryString, (err, response, body) => {
		//body = JSON.parse(body);
		const $ = cheerio.load(body);
		let text = $('.mw-parser-output>p').first().text();
		console.log('\n\n\n')
		console.log(text);
	});
}

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

// Start the GUI Server
server.listen(Config.guiServerPort, () => console.log('running on 3000'));

// Configure the Websocket Server
let wsServer = ws.createServer(function (conn) {
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
			})
			break;
		default:
			break;
	}
	res.render('error');
});
