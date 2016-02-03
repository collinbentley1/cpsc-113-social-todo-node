//Require//

var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser')

//Configure//
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('index');
});
app.post('/user/register', function (req, res) {
    res.send(req.body);
    console.log('The user has the email address' , req.body.email);
});
app.post('/user/login', function (req, res) {
    res.render('index');
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT);
});