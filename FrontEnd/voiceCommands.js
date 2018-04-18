/*
    voiceCommands.js

    Last Updated- EthanShry 20180323

    Collection of all the commands, command strings, and command trigger functions used by the mirror.
    New command template is below

*/

let request = require('sync-request');
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
        // tested, GTG
        {
            name: "weather",
            // what is the weather in 77377
            // camel case names in GUI
            cmdStrings: ["weather", "show me the weather", "get the weather", "can I see the weather", "can I see the weather for %?%", "weather for %?%", "#$# weather in %?%"],
            keywords: ["weather"],
            trigger: (param, activeUser) => {
                param = param == undefined ? 63130 : param;
                // make api call and get weather
                let requestString = config.APIKeys.openweathermap;
                if (isNaN(param)) {
                    requestString = config.APIStrings.openweathermapcity + requestString;
                } else {
                    requestString = config.APIStrings.openweathermapzip + requestString;
                }
                requestString = requestString.replace("%?%", param);
                let responseData = {
                    "location": param,
                    "condition": null,
                    "temperature": null,
                    "humidity": null,
                    "wind": null,
                    "windDirection": null
                };
                let res = request('GET', requestString);
                console.log(res);
                if (res.statusCode == 200) {
                    let body = JSON.parse(res.getBody());
                    responseData.condition = body.weather[0].main;
                    responseData.temperature = Math.round((9/5 * (body.main.temp - 273.15)) + 32);
                    responseData.humidity = body.main.humidity;
                    responseData.wind = body.wind.speed;
                    responseData.windDirection = "N"; //TODO: fix this if we care?
                    return {
                        params: responseData,
                        audioOut: 'It is ' + responseData.temperature + " degrees and " + responseData.condition + " in " + responseData.location,
                        "audioOptions": {
                            shouldOutput: true,
                            property: "audioOut"
                        }
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
        //empty
        //TESTED, GTG
        {
            name: "departure/empty",
            // add "empty"
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
                        "text": "I will remember '" + param + "'",
                        "audioOptions": {
                            shouldOutput: true,
                            property: "text"
                        }
                    }
                };
            },
            viewName: "textDisplay"
        },
        //twitter
        // fix animation to match window.getNextanimationFrame
        {
            name: "twitter",
            cmdStrings: ["open twitter", "%$% my twitter feed", "%$% top tweets", "tweets about %?%"],
            keywords: ["twitter", "tweets"],
            trigger: (param, activeUser) => {
                if (!param) {
                    param = "trending%20now";
                }
                let tRes = request('GET', config.APIStrings.twitter.replace("%?%", param));
                if (tRes.statusCode == 200) {
                    const $ = cheerio.load(tRes.getBody());
                    // SCRAPE
                    let fullnames = [];
                    let handles = [];
                    let timestamps = [];
                    let textContents = [];
                    
                    $(".content .fullname").each((index, elem) => {
                        fullnames[index] = $(elem).text();
                    });
                    $(".content .username").each((index, elem) => {
                        handles[index] = $(elem).text();
                    });
                    $(".content ._timestamp").each((index, elem) => {
                        timestamps[index] =  $(elem).text();
                    });
                    $(".content .tweet-text").each((index, elem) => {
                        let text = $(elem).text();
                        // remove http urls from tweets
                        if (text.indexOf('http://') != -1 || text.indexOf('https://') != -1) {
                            const urlStart = text.indexOf('http');
                            const textPieces = text.split('http');
                            let urlEnd = textPieces[1].indexOf(' ');
                            if (urlEnd == -1) {
                                // no space after url, just take initial piece
                                text = textPieces[0];
                            } else {
                                urlEnd += textPieces[0].length;
                                text = text.substring(urlStart, urlEnd + 1);
                            }
                        }
                        // remove pic.twitter.com links
                        if (text.indexOf('pic.') != -1) {
                            const urlStart = text.indexOf('pic.');
                            const textPieces = text.split('pic.');
                            let urlEnd = textPieces[1].indexOf(' ');
                            if (urlEnd == -1) {
                                // no space after url, just take initial piece
                                text = textPieces[0];
                            } else {
                                urlEnd += textPieces[0].length;
                                text = text.substring(urlStart, urlEnd + 1);
                            }
                        }
                        textContents[index] = text
                    });
                    let fullTweets = [];
                    for (let index in fullnames) {
                        fullTweets.push({
                            username: fullnames[index],
                            handle: handles[index],
                            timestamp: timestamps[index],
                            text: textContents[index]
                        });
                        
                    }
                    return {
                        params: {
                            query: param,
                            tweets: fullTweets,
                            audioOut: "Here are some tweets about " + param,
                            "audioOptions": {
                                shouldOutput: true,
                                property: "audioOut"
                            }
                        }
                    }
                } else {
                    return {
                        error: "Couldn't find tweets about " + param
                    }
                }
            },
            viewName: "twitter"
        },
        //timer
        //TESTED, GTG
        // FIXAUTO
        {
            name: "timer",
            cmdStrings: ["timer for %?%", "%$% timer for %?%"],
            keywords: [],
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
                        duration: duration,
                        text: "timer set for " + param,
                        "audioOptions": {
                            shouldOutput: true,
                            property: "text"
                        }
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
                        text: didDelete ? "Okay, I will forget\n" + param + "\nfor you" : "You have not asked me to remember \n" + param,
                        "audioOptions": {
                            shouldOutput: true,
                            property: "text"
                        }
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
            cmdStrings: ["turn off", "goodbye %$%", "bye %$%"],
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
        // TESTED, GTG
        {
            name: "stock",
            cmdStrings: ["%$% stock overview"],
            keywords: [],
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
        // TESTED, GTG
        {
            name: "single stock",
            cmdStrings: ["show me stock data for %?%", "what does the stock of %?% look like", "stock %$% for %?%"],
            keywords: [],
            trigger: (param, activeUser) => {
                console.log('grabbing stock data for ' + param);
                let res = request('GET', config.APIStrings.alphavantage.replace("%?%", param) + config.APIKeys.alphavantage);
                const data = JSON.parse(res.getBody());
                if ("Error Message" in data) {
                    return {
                        error: "Sorry, no stock data could be found for " + param
                    }
                } else {
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
                    
                    return {
                        params: {
                            stockData: viewData
                        }
                    }
                }
            },
            viewName: "stock"
        },
        //lamp
        // ###V2TODO
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
        // ###V2TODO
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
        },
        //Switch User
        // DONE, UNTESTED
        // ###V2TODO
        {
            name: "request switch user",
            cmdStrings: ["change user", "switch user"],
            keywords: [],
            trigger: (param, activeUser) => {
                return {
                    params: {
                        text: "Okay! I will take a photo to see if you match any known users",
                        hardware: "switchUser"
                    }
                }
            },
            viewName: "textDisplay"
        },
    ]
};