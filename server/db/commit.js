var mongoose = require('mongoose');


module.exports = mongoose.model('Commit', new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        index: true
    },
    hour: Number,
    day: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },
    languages: [String]
}));
