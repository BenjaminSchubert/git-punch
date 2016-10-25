var mongoose = require('mongoose');


/**
 * Describes
 * @type {mongoose.Schema}
 */
var schema = new mongoose.Schema({
    id: {
        type: Number,
        index: true
    },
    user: {
        type: Number,
        index: true
    },
    name: {
        type: String
    },
    full_name: {
        type: String
    },
    color: {
        type: String
    },
    languages: [String]
});

schema.index({ "id": 1, "user": 1 }, { unique: true });

module.exports = mongoose.model('Repository', schema);
