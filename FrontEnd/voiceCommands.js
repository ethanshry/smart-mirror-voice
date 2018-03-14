let request = require('sync-request');
let twitterAPI = require('twitter');

let cheerio = require('cheerio');

let fs = require('fs');

module.exports = {
    // note- param character: %?%
    // whitelist characters (any filler): %$%
    /*
    command template
    {
            name: "descriptive name, only for coder use",
            cmdStrings: ["list of strings. Can make use of %?% for parameter, %#% for continuous whitelist character sequence. Max 1 of each per command"],
            keywords: ["keyword list. should be unique to only this command- idea is if no cmdString matches for any command, will loop back to look for keyword in command. no %?% or %#% allowed"],
            trigger: (param) => {
                // if your cmdString had a %?% in it, will be passed in as param.
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
                };
            },
            viewName: "name of .pug file which should be displayed as a result of this command"
        },

    */
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
        //TESTED, GTG
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
        //TESTED, GTG
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
                return {
                    param: {}
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
            trigger: (param) => {
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
        //TESTED, GTG (ish)
        {
            name: "wikipedia",
            cmdStrings: ["who is %?%", "what is %?%", "where is %?%", "wiki search %?%"],
            keywords: [],
            trigger: (param) => {
                console.log("requestinig");
                const queryString = "https://en.wikipedia.org/wiki/" + param.replace("/ /g ", "_");
                /*request(queryString, (err, response, body) => {
                    console.log("returning");
                    const $ = cheerio.load(body);
                    let text = $('.mw-parser-output>p').first().text();
                    return {
                        params: {
                            text: text,
                            source: "wikipedia.org"
                        }
                    }
                });*/
                let res = request('GET', queryString);
                const $ = cheerio.load(res.getBody());
                let text = $('.mw-parser-output>p').first().text();
                return {
                    params: {
                        text: text,
                        source: "wikipedia.org"
                    }
                }
            },
            viewName: "textDisplay"
        }
    ]
};