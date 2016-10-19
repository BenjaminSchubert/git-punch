var mongoose = require('mongoose');


module.exports = mongoose.model('Commit', new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        index: true
    },
    hour: Number,
    day: Number,
    languages: [String]
}));
