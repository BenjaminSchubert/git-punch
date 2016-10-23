var mongoose = require('mongoose');


var schema = new mongoose.Schema({
    sha: {
        type: String,
        index: true
    },
    hour: Number,
    day: Number,
    user: {
        type: Number,
        index: true
    },
    project: {
        type: Number,
        index: true
    },
    languages: [String]
});


schema.index({ "sha": 1, "project": 1 }, { unique: true});

module.exports = mongoose.model('Commit', schema);
