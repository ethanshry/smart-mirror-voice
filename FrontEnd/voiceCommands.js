module.exports = {
    commands: [
        {
            name: "demo",
            cmdStrings: ["testing 1, 2, 3", "testing", "this is a test"],
            keywords: ["test"],
            trigger: (cmdString) => {
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
        }

    ]
};