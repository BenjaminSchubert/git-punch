var db = require("../db/db");
var linguist = require("../utils/linguist");

var Commit = db.Commit;


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
        pipeline.unshift({ $match: { "user": session.userId } })
    }

    return Commit
        .aggregate(pipeline)
        .then(function(data) {
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
