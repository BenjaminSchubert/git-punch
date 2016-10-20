var mongoose = require('mongoose');


module.exports = mongoose.model('User', new mongoose.Schema({
    _id: {
        type: Number,
        unique: true,
        index: true
    }
}));
