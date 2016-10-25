/**
 * Various utilities for the api
 */

var db = require("../db/db");
var linguist = require("../utils/linguist");

var Commit = db.Commit;


/**
 * Get the languages for a given user.
 *
 * If the user is undefined, will return the languages for all commits
 *
 * @param session of the user
 * @returns {*}
 */
function getLanguages(session) {
    var pipeline = [
        { $unwind: "$languages" },
        { $group: {
            _id: null,
            languages: { $addToSet: "$languages" }
        }},
        { $project: { languages: 1, _id: 0 } }
    ];

    if (session !== undefined) {
        // session is defined, let's match user
        pipeline.unshift({ $match: { "user": session.userId } })
    }

    return Commit
        .aggregate(pipeline)
        .then(function(data) {
            // no commits, let's return
            if (data.length === 0) {
                return [];
            }

            return data[0].languages.map(function(language) {
                return {
                    language: language,
                    color: linguist.color(language)
                }
            });
        })
}


module.exports = {
    getLanguages: getLanguages
};
