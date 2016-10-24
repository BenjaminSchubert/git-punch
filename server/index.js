var express = require("express");
var session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);


var auth = require("./auth");
var api = require("./api/api");


const SECRET_KEY = process.env.SECRET_KEY;
const MONGODB = process.env["MONGODB_URI"];

if (SECRET_KEY === undefined) {
    console.log("SECRET_KEY is not defined");
    process.exit(1);
}

if (MONGODB === undefined) {
    console.log("MONGODB_URI is undefined");
    process.exit(1);
}



var app = express();

var store = new MongoDBStore({
    uri: MONGODB,
    collection: 'sessions'
});


if (process.env.NODE_ENV === "development") {
    app.use(require("connect-livereload")({
        port: 35729
    }))
}


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
