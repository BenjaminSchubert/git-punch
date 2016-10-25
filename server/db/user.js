var mongoose = require('mongoose');

/**
 * Schema representing a user
 *
 * @type {mongoose.Schema}
 */
module.exports = mongoose.model('User', new mongoose.Schema({
    _id: {
        type: Number,
        unique: true,
        index: true
    }
}));
