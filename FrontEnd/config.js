module.exports = {
    guiServerPort: 3000,
    websocketServerPort: 8080,
    shouldGiveVerbalResponse: false,
    setCommandTimeout: undefined,
    APIKeys: {
        openweathermap: "",
        twitter: {
            consumerKey : "",
            consumerSecret: "",
            accessToken: "",
            accessTokenSecret: ""
        },
        alphavantage: "USWBMZGLU1OGTPQR"
    },
    APIStrings: {
        openweathermapzip: "https://api.openweathermap.org/data/2.5/weather?zip=%?%&APPID=",
        openweathermapcity: "https://api.openweathermap.org/data/2.5/weather?q=%?%&APPID=",
        alphavantage: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=FDYNX&apikey=",
        zipcodefromcity: "http://maps.googleapis.com/maps/api/geocode/json?address=%?%&sensor=true",
        qwant: "https://api.qwant.com/api/search/images?count=1&offset=1&q=%?%"
    }
}