var http = require("request-promise");
var link = require("parse-link-header");


function _fetchApi(path, session, acc) {
    if (session.ghRateLimitReset) {
        if (new Date(session.ghRateLimitReset) > new Date()) {
            return Promise.reject({ rateLimit: true, body: acc });
        } else {
            delete session.ghRateLimitReset;
        }
    }

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
                session.ghRateLimitReset = error.response.headers["x-ratelimit-reset"] * 1000;
                error.rateLimit = true;
                if (acc !== undefined) {
                    error.body = acc;
                }
            }
            throw error;
        })
}

function fetchApi(path, session, raw) {
    return _fetchApi(raw ? path : "https://api.github.com/" + path, session);
}

module.exports = fetchApi;
