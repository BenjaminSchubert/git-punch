"use strict";

var mongoose = require('mongoose');


/**
 * Schema representing a commit
 *
 * @type {mongoose.Schema}
 */
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
    repository: {
        type: Number,
        index: true
    },
    languages: [String]
});


schema.index({ "sha": 1, "repository": 1 }, { unique: true });

module.exports = mongoose.model('Commit', schema);
