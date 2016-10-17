var express = require("express");
var session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);


var auth = require("./auth");
var api = require("./api/api");


var SECRET_KEY = process.env.SECRET_KEY;

if (SECRET_KEY === undefined) {
    console.log("SECRET_KEY is not defined");
    process.exit(1);
}


var app = express();

var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/gstats',
    collection: 'gstats.sessions'
});


app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    name: "session",
    cookie: {
        httpOnly: true,
        sameSite: true,
        secure: false, // FIXME need HTTPS for this
        maxAge: 1000 * 3600 * 24 * 31, // one month
        rolling: true
    }
}));


app.set("port", (process.env.PORT || 5000));

app.use(express.static("dist/"));
app.use("/auth", auth);
app.use("/api", api);


app.listen(app.get("port"), function() {
    console.log("Node app is running on port", app.get("port"));
});
