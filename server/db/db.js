var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;


const MONGODB = process.env["MONGODB_URI"];

if (MONGODB === undefined) {
    console.log("MONGODB_URI is undefined");
    process.exit(1);
}

mongoose.connect(MONGODB);


var Commit = mongoose.model('Commit', new Schema({
    _id: {
        type: String,
        unique: true,
        index: true
    },
    hour: Number,
    day: Number,
    project: String,
    languages: [String]
}));


module.exports = {
    Commit: Commit
};
