var mongoose = require('mongoose');


module.exports = mongoose.model('Project', new mongoose.Schema({
    _id: {
        type: Number,
        index: true,
        unique: true
    },
    name: {
        type: String
    },
    url: {
        type: String
    },
    color: {
        type: String
    },
    languages: [String]
}));
