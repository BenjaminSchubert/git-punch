var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;


var connection = mongoose.connect("mongodb://localhost/gstats");


var Commit = mongoose.model('Commit', new Schema({
    _id: {
        type: String,
        unique: true,
        index: true
    },
    hour: Number,
    day: Number,
    project: String,
    files: [String]
}));


module.exports = {
    Commit: Commit
};
