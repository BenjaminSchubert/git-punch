var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;


mongoose.connect("mongodb://localhost/gstats");


var Commit = mongoose.model('Commit', new Schema({
    _id: {
        type: String,
        unique: true,
        index: true
    },
    hour: Number,
    day: Number,
    project: String,
    languages: [String],
    extensions: [String]
}));


module.exports = {
    Commit: Commit
};
