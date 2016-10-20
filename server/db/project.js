var mongoose = require('mongoose');


module.exports = mongoose.model('Project', new mongoose.Schema({
    _id: {
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "User"
    }
}));
