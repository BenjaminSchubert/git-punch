var http = require("request-promise");


function fetchApi(path, session) {
    return http.get(
        {
            url: "https://api.github.com/" + path,
            headers: {
                Authorization: "token " + session.access_token,
                "User-Agent": "Github-Stats"
            }
        }
    )
}

module.exports = fetchApi;
