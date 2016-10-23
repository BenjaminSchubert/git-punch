var mongoose = require('mongoose');


module.exports = mongoose.model('Repository', new mongoose.Schema({
    _id: {
        type: Number,
        index: true,
        unique: true
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
}));
