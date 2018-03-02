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
                // remove whole command
                return "weather"
            },
            load: "demoPage"
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
            load: "textDisplay"
        },
        //empty
        {
            name: "departure/empty",
            cmdStrings: ["goodbye", "see you later", "have a %?% day", "bye", "clear", "off", "turn off", "sleep", "go to sleep"],
            keywords: ["bye", "clear"],
            trigger: (cmdString) => {
                return
            },
            load: "empty"
        },
        //remember
        {
            name: "remember",
            cmdStrings: ["remember %?%", "remind me %?%"],
            keywords: ["remind"],
            trigger: (cmdString, param) => {
                // STORE param in userData.json
                return {
                    params: {
                        "text": "I will remember " + param
                    }
                };
            },
            load: "textDisplay"
        },
        //twitter
        {
            name: "twitter",
            cmdStrings: ["open twitter", "%$% my twitter feed", "%$% top tweets"],
            keywords: ["twitter", "tweets"],
            trigger: (cmdString, param) => {
                // TODO: return twitter info
                return 
            },
            load: "twitter"
        },
        //timer
        {
            name: "timer",
            cmdStrings: ["%$% timer for %?%"],
            keywords: ["timer"],
            trigger: (cmdString, param) => {
                // process timer
                const cmdPiece = param.split(" ");
                const duration = parseInt(cmdPiece[0]);
                if (cmdPiece[1] == "minutes" || cmdPiece[1] == "minute") {
                    duration *= 60;
                } else if (cmdPiece[1] == "hours" || cmdPiece[1] == "hour") {
                    duration *= 3600;
                } else {
                    duration = NaN;
                }
                return {
                    params: {
                        duration: duration
                    }
                }
            },
            load: "timer"
        },
        //home/welcome
        {
            name: "home",
            cmdStrings: ["navigate home", "go home", "main", "overview", "welcome screen", "home page", "homepage"],
            keywords: ["home", "welcome"],
            trigger: (cmdString, param) => {
                return 
            },
            load: "main"
        },
        //forget
        {
            name: "forget",
            cmdStrings: ["forget %?%"],
            keywords: [""],
            trigger: (cmdString, param) => {
                // search through remembered items, delete if has match
                return {
                    params: {
                        text: "Okay, I will forget\n" + param + "\nfor you"
                    }
                }
            },
            load: "textDisplay"
        },
        //remind
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //time
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //departure
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //compliment
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //stock???
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //lamp
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        },
        //wiki webcrawler??
        {
            name: "",
            cmdStrings: ["", ""],
            keywords: [""],
            trigger: (cmdString, param) => {
                return 
            },
            load: ""
        }
    ]
};