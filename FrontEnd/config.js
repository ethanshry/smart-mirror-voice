/*
    config.js

    Last Updated- EthanShry 20180321

    Has App-level config data, i.e. preferred port data, API keys, etc

*/

module.exports = {
    guiServerPort: 3000,
    websocketServerPort: 8080,
    shouldGiveVerbalResponse: false,
    setCommandTimeout: undefined,
    APIKeys: {
        openweathermap: "",
        alphavantage: "USWBMZGLU1OGTPQR"
    },
    APIStrings: {
        openweathermapzip: "https://api.openweathermap.org/data/2.5/weather?zip=%?%&APPID=",
        openweathermapcity: "https://api.openweathermap.org/data/2.5/weather?q=%?%&APPID=",
        alphavantage: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=%?%&apikey=",
        zipcodefromcity: "http://maps.googleapis.com/maps/api/geocode/json?address=%?%&sensor=true",
        qwant: "https://api.qwant.com/api/search/images?count=1&offset=1&q=%?%",
        twitter: "https://twitter.com/search?q=%?%&src=typd&lang=en"
    }
}