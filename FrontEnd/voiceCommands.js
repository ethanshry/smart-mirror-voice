module.exports = {
    commands: [
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
        {
            name: "departure/empty",
            cmdStrings: ["goodbye", "see you later", "have a %?% day", "bye", "clear", "off", "turn off", "sleep", "go to sleep"],
            keywords: ["bye", "clear"],
            trigger: (cmdString) => {
                return
            },
            load: "empty"
        },
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
        }
    ]
};