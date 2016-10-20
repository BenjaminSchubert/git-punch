var mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const MONGODB = process.env["MONGODB_URI"];

if (MONGODB === undefined) {
    console.log("MONGODB_URI is undefined");
    process.exit(1);
}

mongoose.connect(MONGODB);


module.exports = {
    Commit: require("./commit"),
    User: require("./user")
};
