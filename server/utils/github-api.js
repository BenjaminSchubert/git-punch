/**
 * Provides helpers to interact with GitHub API
 */

var http = require("request-promise");
var link = require("parse-link-header");


/**
 * Fetch the path recursively if a link is present in the header and returns the body concatenated
 *
 * @param path to fetch
 * @param session with which to authenticate
 * @param acc value from previous calls
 * @returns {*}
 * @private
 */
function _fetchApi(path, session, acc) {
    if (session.ghRateLimitReset) {
        if (new Date(session.ghRateLimitReset) > new Date()) {
            return Promise.reject({ rateLimit: true, body: acc });
        } else {
            delete session.ghRateLimitReset;
        }
    }

    return http
        .get({
            url: path,
            headers: {
                Authorization: "token " + session.access_token,
                "User-Agent": "Github-Stats"
            },
            resolveWithFullResponse: true
        })
        .catch(function(error) {
            if (error.response.statusCode === 403) {
                if (error.response.headers["x-ratelimit-remaining"] === "0") {
                    session.ghRateLimitReset = error.response.headers["x-ratelimit-reset"] * 1000;
                    error.rateLimit = true;
                } else if (error.response.headers["retry-after"] !== undefined) {
                    session.ghRateLimitReset = error.response.headers["retry-after"] * 1000;
                    error.rateLimit = true;
                }

                if (acc !== undefined) {
                    error.body = acc;
                }
            }
            return Promise.reject(error);
        })
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
        });
}

/**
 * fetch the data available on the given path
 *
 * @param path to fetch
 * @param session with which to authenticate to make the call
 * @param raw if the github API url must not be prepended to the path
 */
function fetchApi(path, session, raw) {
    return _fetchApi(raw ? path : "https://api.github.com/" + path, session);
}

module.exports = fetchApi;
