/*
    voiceCommands.js

    Last Updated- EthanShry 20180321

    Collection of all the commands, command strings, and command trigger functions used by the mirror.
    New command template is below

*/

let request = require('sync-request');
let twitterAPI = require('twitter');
//used for wikipedia API body parsing
let cheerio = require('cheerio');

let fs = require('fs');

let config = require('./config');

module.exports = {
    // note- param character: %?%
    // whitelist characters (any filler): %$%
    /*
    command template
    {
            name: "descriptive name, only for coder use",
            // NOTE: cmdStrings are checked left to right, so if you wish to prefer one then place it in lower array index
            cmdStrings: [
                "list of strings
                Can make use of %?% for parameter
                Can make use of %$% for continuous whitelist character sequence
                Max 1 of each per command
                Must have seperator for %?% and %$%. i.e. %$% timer for %?% is valid, timer %$% %?% is not valid"
                ],
            // note, keyword will match to command if STT input contains the keyword, therefore MUST NOT overlap with possible keyword for any other command
            keywords: ["keyword list. should be unique to only this command- idea is if no cmdString matches for any command, will loop back to look for keyword in command. no %?% or %#% allowed"],
            trigger: (param, activeUser) => {
                // if your cmdString had a %?% in it, will be passed in as param.
                // MUST RETURN {params:{}} at a minimum
                return {
                    // all UIs expect data in this form
                    params: {
                        // inner object here is unique to each view
                        //"audioOptions" is optional, should follow this format- shouldOutput must be set to true to send audio
                        // property value is the value of the property in the first level of param: {} which contains the text to be used as audio out
                        "audioOptions": {
                            shouldOutput: true,
                            property: "propContainingAudioText"
                        }
                    }
                    // as alternate, if your trigger experiences an error, can return
                    error: "error message"
                };
            },
            viewName: "name of .pug file which should be displayed as a result of this command i.e. stockView"
        },

    */
    commands: [
        //weather
        {
            name: "weather",
            cmdStrings: ["weather", "show me the weather", "get the weather", "can I see the weather", "can I see the weather for %?%", "weather for %?%", "weather in %?%"],
            keywords: ["weather"],
            trigger: (param, activeUser) => {
                param = param == undefined ? 63130 : param;
                // make api call and get weather
                let requestString = config.APIKeys.openweathermap;
                console.log(parseInt(param));
                if (isNaN(param)) {
                    requestString = config.APIStrings.openweathermapcity + requestString;
                } else {
                    // ###TODO: Fix, is currently only accepting zip ocdes, errors on cities and never gets here
                    requestString = config.APIStrings.openweathermapzip + requestString;
                }
                requestString = requestString.replace("%?%", param);
                console.log(requestString);
                let responseData = {
                    "condition": null,
                    "temperature": null,
                    "humidity": null,
                    "wind": null,
                    "windDirection": null
                };
                let res = request('GET', requestString);
                if (res.responseCode == 200) {
                    let body = JSON.parse(res.getBody());
                    responseData.condition = body.weather[0].main;
                    responseData.temperature = Math.round((9/5 * body.main.temp - 273.15) + 32);
                    responseData.humidity = body.main.humidity;
                    responseData.wind = body.wind.speed;
                    responseData.windDirection = "N"; //TODO: fix this if we care?
                    console.log(responseData);
                    return {
                        params: responseData
                    }
                } else {
                    return {
                        error: "Sorry, could not get the weather for " + param
                    }
                }
            },
            viewName: "weather"
        },
        //greeting
        //TESTED, GTG
        {
            name: "greeting",
            cmdStrings: ["hi", "how are you", "what's up", "how are you today", "hello"],
            keywords: ["hello"],
            trigger: (param, activeUser) => {
                // expand return options
                const returnVals = ["Welcome, " + activeUser, "Hello " + activeUser + ". It's nice to see you today", "Welcome back!"];
                return {
                    params: {
                        "text": returnVals[Math.floor(Math.random() * returnVals.length)]
                    }
                };
            },
            viewName: "textDisplay"
        },
        //empty
        //TESTED, GTG
        {
            name: "departure/empty",
            cmdStrings: ["goodbye", "see you later", "have a %$% day", "bye", "clear", "off", "turn off", "sleep", "go to sleep"],
            keywords: ["bye", "clear"],
            trigger: (cmdString) => {
                return {
                    params: {}
                }
            },
            viewName: "empty"
        },
        //remember
        // TESTED, GTG
        {
            name: "remember",
            cmdStrings: ["remember %?%", "remind me %?%"],
            keywords: [],
            trigger: (param, activeUser) => {
                // STORE param in userData.json
                let content = JSON.parse(fs.readFileSync('./userData.json'));
                content.users[activeUser].rememberedItems.push(param);
                fs.writeFileSync('./userData.json', JSON.stringify(content));
                return {
                    params: {
                        "text": "I will remember " + param
                    }
                };
            },
            viewName: "textDisplay"
        },
        //twitter
        {
            name: "twitter",
            cmdStrings: ["open twitter", "%$% my twitter feed", "%$% top tweets", "tweets about %?%"],
            keywords: ["twitter", "tweets"],
            trigger: (param, activeUser) => {
                // TODO: return twitter info
                let caller = new twitterAPI({
                    consumer_key: config.APIKeys.twitter.consumerKey,
                    consumer_secret: config.APIKeys.twitter.consumerSecret,
                    access_token_key: config.APIKeys.twitter.accessToken,
                    access_token_secret: config.APIKeys.twitter.accessTokenSecret
                });
                caller.get('search/tweets', {q: param}).then( (error, tweets, response) => {
                    tweets.statuses.forEach((tweet, index) => {
                        tweets.statuses[index] = {
                            text: tweet.text,
                            timestamp: tweet.created_at,
                            user: tweet.user.name
                        }
                    });
                    console.log(tweets);
                    //console.log(tweets.statuses[0].user);
                    return {
                        params: tweets
                    };
                }); 
            },
            viewName: "twitter"
        },
        //timer
        //TESTED, GTG
        {
            name: "timer",
            cmdStrings: ["%$% timer for %?%"],
            keywords: ["timer"],
            trigger: (param, activeUser) => {
                // process timer
                const cmdPiece = param.split(" ");
                let duration = parseInt(cmdPiece[0]);
                if (cmdPiece[1] == "minutes" || cmdPiece[1] == "minute") {
                    duration *= 60;
                } else if (cmdPiece[1] == "hours" || cmdPiece[1] == "hour") {
                    duration *= 3600;
                } else if (cmdPiece[1] == "seconds" || cmdPiece[1] == "second") {
                    // don't change duration
                } else {
                    duration = NaN;
                }
                return {
                    params: {
                        duration: duration
                    }
                }
            },
            viewName: "timer"
        },
        //home/welcome
        // TESTED, GTG (though should display some data, so trigger may need to be altered)
        {
            name: "home",
            cmdStrings: ["navigate home", "go home", "main", "overview", "welcome screen", "home page", "homepage"],
            keywords: ["home", "welcome"],
            trigger: (param, activeUser) => {
                let content = JSON.parse(fs.readFileSync('./userData.json'));
                return {
                    params: {
                        "user": activeUser,
                        "hotwords": content.users[activeUser].hotwords
                    }
                }
            },
            viewName: "main"
        },
        //forget
        // TESTED, GTG
        {
            name: "forget",
            cmdStrings: ["forget %?%"],
            keywords: [],
            trigger: (param, activeUser) => {
                // search through remembered items, delete if has match
                let didDelete = false;
                let content = JSON.parse(fs.readFileSync('./userData.json'));
                if (content.users[activeUser].rememberedItems.indexOf(param) != -1) {
                    didDelete = true;
                    content.users[activeUser].rememberedItems.splice(content.users[activeUser].rememberedItems.indexOf(param), 1);
                }
                fs.writeFileSync('./userData.json', JSON.stringify(content));
                return {
                    params: {
                        text: didDelete ? "Okay, I will forget\n" + param + "\nfor you" : "You have not asked me to remember \n" + param
                    }
                };
                
            },
            viewName: "textDisplay"
        },
        //remind
        // TESTED, GTG
        {
            name: "remind",
            cmdStrings: ["%$% what have I forgotten", "remind me", "recall my reminders"],
            keywords: ["remind", "recall", "forgotten"],
            trigger: (param, activeUser) => {
                let content = JSON.parse(fs.readFileSync('./userData.json'));
                return {
                    params: {
                        "items": content.users[activeUser].rememberedItems
                    }
                };
            },
            viewName: "remind"
        },
        //time
        // TESTED, GTG
        {
            name: "time",
            cmdStrings: ["what time is it", "show me the clock", "what's the date", "what day is today"],
            keywords: ["time", "date"],
            trigger: (param, activeUser) => {
                return {
                    params: {}
                }
            },
            viewName: "time"
        },
        //departure
        // TESTED, GTG (remove for empty?)
        {
            name: "departure",
            cmdStrings: ["turn off", "goodbye", "bye %$%"],
            keywords: ["bye", "off", "shutdown"],
            trigger: (param, activeUser) => {
                // TODO: triger voice off?
                return {
                    params: {}
                }
            },
            viewName: "empty"
        },
        //compliment
        //TESTED, GTG
        {
            name: "compliment",
            cmdStrings: ["how do i look", "do i look %$%"],
            keywords: ["compliment"],
            trigger: (param, activeUser) => {
                const returnVals = ["Lookin Smokin!", "You look Fantastic!", "10/10 IGN"];
                return {
                    params: {
                        "text": returnVals[Math.floor(Math.random() * returnVals.length)],
                        "audioOptions": {
                            shouldOutput: true,
                            property: "text"
                        }
                    }
                };
            },
            viewName: "textDisplay"
        },
        //stock portfolio
        {
            name: "stock",
            cmdStrings: ["%$% stock overview"],
            keywords: [""],
            trigger: (param, activeUser) => {
                // construct data outline:
                let returnVal = {
                    stockSeries: []
                };
                let content = JSON.parse(fs.readFileSync('./userData.json'));
                content.users[activeUser].importantStocks.forEach((stock) => {
                    console.log('grabbing stock data for ' + stock);
                    let res = request('GET', config.APIStrings.alphavantage.replace("%?%", stock) + config.APIKeys.alphavantage);
                    const data = JSON.parse(res.getBody());
                    let viewData = {
                        title: data["Meta Data"]["2. Symbol"],
                        data: [],
                        labels: []
                    };
                    let hasChange = false;
                    for (let key in data["Time Series (Daily)"]) {
                        // on first time through, create a +/- header for the graph based on today's open vs. current performance
                        if (hasChange == false) {
                            let change = Number(data["Time Series (Daily)"][key]["4. close"]) - Number(data["Time Series (Daily)"][key]["1. open"]);
                            if (change >= 0) {
                                viewData.title += " \u25B2 " + Math.round(change * 100) / 100;
                            } else {
                                viewData.title += " \u25BC " + Math.round(Math.abs(change) * 100) / 100;
                            }
                            hasChange = true;
                        }
                        let item = {
                            x: Date.parse(key),
                            y: Number(data["Time Series (Daily)"][key]["4. close"])
                        };
                        viewData.data.push(item);
                        viewData.labels.push(key);
                    }
                    // must flip order of labels so that they run old-new for the graphing API
                    viewData.data = viewData.data.reverse();
                    viewData.labels = viewData.labels.reverse();
                    returnVal.stockSeries.push(viewData);
                });
                return {
                    params: {
                        stockData: returnVal
                    }
                }
            },
            viewName: "stockOverview"
        },
        //single stock
        {
            name: "single stock",
            cmdStrings: [],
            keywords: [],
            trigger: (param, activeUser) => {
                return {
                    params: {
                        
                    }
                }
            },
            viewName: ""
        },
        //lamp
        {
            name: "",
            cmdStrings: [],
            keywords: [],
            trigger: (param, activeUser) => {
                return {
                    params: {
                        
                    }
                }
            },
            viewName: ""
        },
        //iOT IP set
        // DONE, UNTESTED
        {
            name: "set ip",
            cmdStrings: ["set lamp ip to %?%"],
            keywords: [],
            trigger: (param, activeUser) => {
                const conversions = {
                    "one": 1,
                    "two": 2,
                    "three": 3,
                    "four": 4,
                    "five": 5,
                    "six": 6,
                    "seven": 7,
                    "eight": 8,
                    "nine": 9,
                    "point": ".",
                    " ": ""
                }
                console.log(param);
                Object.keys(conversions).forEach((key) => {
                    param = param.split(key).join(conversions[key]);
                });

                return {
                    params: {
                        text: "IP set to " + param
                    }
                }
            },
            viewName: "textDisplay"
        },
        //wiki webcrawler
        //TESTED, GTG (ish)
        // would love to put a lot more time into web scraping- wonder if brain.js would be useful here
        {
            name: "wikipedia",
            cmdStrings: ["who is %?%", "what is %?%", "where is %?%", "wiki search %?%", "what are %?%"],
            keywords: [],
            trigger: (param, activeUser) => {
                // wiki articles follow naming convention .../wiki/word1_word2_...
                const queryString = "https://en.wikipedia.org/wiki/" + param.replace("/ /g ", "_");
                let res = request('GET', queryString);
                if (res.statusCode == 200) {
                    // cheerio mimics jQuery, so lets make it super jQuery-esque
                    const $ = cheerio.load(res.getBody());
                    return {
                        params: {
                            text: $('.mw-parser-output>p').first().text(),
                            source: 'wikipedia.org'
                        }
                    }
                } else {
                    return {
                        error: "Sorry, an error occured. We couldn't find data on " + param
                    }
                }    
            },
            viewName: "textDisplay"
        }
    ]
};