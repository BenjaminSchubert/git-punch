var http = require("request-promise");
var link = require("parse-link-header");


function _fetchApi(path, session, acc) {
    return http.get(
        {
            url: path,
            headers: {
                Authorization: "token " + session.access_token,
                "User-Agent": "Github-Stats"
            },
            resolveWithFullResponse: true
        }
    )
        .then(function(data) {
            var links = link(data.headers.link);
            var body = JSON.parse(data.body);

            if (acc !== undefined) {
                body = body.concat(acc);
            }

            if (links !== null && links.next !== undefined) {
                return _fetchApi(links.next.url, session, body);
            } else {
                return body;
            }
        })
        .catch(function(error) {
            if (error.response.statusCode === 403 && error.response.headers["x-ratelimit-remaining"] === "0") {
                session.retryIn = error.response.headers["X-RateLimit-Reset"] * 1000;
                error.rateLimit = true;
            }
            throw error;
        })
}

function fetchApi(path, session, raw) {
    return _fetchApi(raw ? path : "https://api.github.com/" + path, session);
}

module.exports = fetchApi;
