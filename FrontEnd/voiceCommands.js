let request = require('request');
let twitterAPI = require('twitter');

let cheerio = require('cheerio');

let fs = require('fs');

module.exports = {
    // note- param character: %?%
    // whitelist characters (any filler): %$%
    commands: [
        //demo
        {
            name: "demo",
            cmdStrings: ["testing 1, 2, 3", "testing", "this is a test"],
            keywords: ["test"],
            trigger: (cmdString) => {
                // ###TODO remove whole command
                return {
                    params: {
                        test: "testing"
                    }
                }
            },
            viewName: "weather"
        },
        //weather
        {
            name: "weather",
            cmdStrings: ["weather", "show me the weather", "get the weather", "can I see the weather", "can I see the weather for %?%", "weather for %?%", "weather in %?%"],
            keywords: ["weather"],
            trigger: (argument) => {
                // make api call and get weather
                return {
                    params: {
                        temperature: "87",
                        condition: "overcast"
                    }
                }
            },
            viewName: "weather"
        },
        //greeting 
        {
            name: "greeting",
            cmdStrings: ["hi", "how are you", "what's up", "how are you today", "hello"],
            keywords: ["hello"],
            trigger: (cmdString) => {
                // expand return options
                const returnVals = ["I'm good", "It's nice to see you today", "Welcome back!"];
                return {
                    params: {
                        "text": returnVals[Math.floor(Math.random() * returnVals.length)]
                    }
                };
            },
            viewName: "textDisplay"
        },
        //empty
        {
            name: "departure/empty",
            cmdStrings: ["goodbye", "see you later", "have a %$% day", "bye", "clear", "off", "turn off", "sleep", "go to sleep"],
            keywords: ["bye", "clear"],
            trigger: (cmdString) => {
                return
            },
            viewName: "empty"
        },
        //remember
        {
            name: "remember",
            cmdStrings: ["remember %?%", "remind me %?%"],
            keywords: [],
            trigger: (param) => {
                // STORE param in userData.json
                fs.readFile('userData.json', (err, json) => {
                    if (err) throw err;
                    let content = JSON.parse(json);
                    content.rememberedItems.push(param);
                    fs.writeFile('userData.json', JSON.stringify(content), (err) => {
                        if (err) throw err;
                        return {
                            params: {
                                "text": "I will remember " + param
                            }
                        };
                    });
                });
                
            },
            viewName: "textDisplay"
        },
        //twitter
        {
            name: "twitter",
            cmdStrings: ["open twitter", "%$% my twitter feed", "%$% top tweets"],
            keywords: ["twitter", "tweets"],
            trigger: (param) => {
                // TODO: return twitter info
                return 
            },
            viewName: "twitter"
        },
        //timer
        //TESTED, GTG
        {
            name: "timer",
            cmdStrings: ["%$% timer for %?%"],
            keywords: ["timer"],
            trigger: (param) => {
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
        {
            name: "home",
            cmdStrings: ["navigate home", "go home", "main", "overview", "welcome screen", "home page", "homepage"],
            keywords: ["home", "welcome"],
            trigger: (param) => {
                return 
            },
            viewName: "main"
        },
        //forget
        {
            name: "forget",
            cmdStrings: ["forget %?%"],
            keywords: [],
            trigger: (param) => {
                // search through remembered items, delete if has match
                fs.readFile('userData.json', (err, json) => {
                    if (err) throw err;
                    let content = JSON.parse(json);
                    if (content.rememberedItems.indexOf(param) != -1) {
                        content.rememberedItems = content.rememberedItems.splice(content.rememberedItems.indexOf(param), 1);
                    }
                    fs.writeFile('userData.json', JSON.stringify(content), (err) => {
                        if (err) throw err;
                        return {
                            params: {
                                text: "Okay, I will forget\n" + param + "\nfor you"
                            }
                        }
                    });
                });
                
            },
            viewName: "textDisplay"
        },
        //remind
        {
            name: "remind",
            cmdStrings: ["%$% what have I forgotten", "remind me", "recall my reminders"],
            keywords: ["remind", "remember", "forgotten"],
            trigger: (param) => {
                fs.readFile('userData.json', (err, json) => {
                    if (err) throw err;
                    let content = JSON.parse(json);
                    return {
                        params: {
                            "items": content.rememberedItems
                        }
                    };
                });
            },
            viewName: "remind"
        },
        //time
        {
            name: "",
            cmdStrings: [],
            keywords: [],
            trigger: (param) => {
                return 
            },
            viewName: ""
        },
        //departure
        {
            name: "departure",
            cmdStrings: ["turn off", "goodbye", "bye %$%"],
            keywords: ["bye", "off", "shutdown"],
            trigger: (param) => {
                return 
            },
            viewName: "empty"
        },
        //compliment
        {
            name: "",
            cmdStrings: [],
            keywords: [],
            trigger: (param) => {
                return 
            },
            viewName: ""
        },
        //stock???
        {
            name: "",
            cmdStrings: [],
            keywords: [],
            trigger: (param) => {
                return 
            },
            viewName: ""
        },
        //lamp
        {
            name: "",
            cmdStrings: [],
            keywords: [],
            trigger: (param) => {
                return 
            },
            viewName: ""
        },
        //wiki webcrawler
        {
            name: "wikipedia",
            cmdStrings: ["who is %?%", "what is %?%", "where is %?%", "wiki search %?%"],
            keywords: [],
            trigger: (param) => {
                const queryString = "https://en.wikipedia.org/wiki/" + param.replace("/ /g ", "_");
                request(queryString, (err, response, body) => {
                    const $ = cheerio.load(body);
                    let text = $('.mw-parser-output>p').first().text();
                    return {
                        params: {
                            text: text,
                            source: "wikipedia.org"
                        }
                    }
                }); 
            },
            viewName: "textDisplay"
        }
    ]
};