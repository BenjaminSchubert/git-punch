var express = require('express');
var app = express();


var ghPages = "https://flagoul.github.io/HEIG_TWEB_2016_lab01/";
var assets = ghPages + "/assets";


app.set('port', (process.env.PORT || 5000));


app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('index', { assets: assets, ghPages: ghPages});
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
