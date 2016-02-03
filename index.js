//Require//

var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var Users = require('./models/users.js');

//Configure//
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Home//

app.get('/', function (req, res) {
   Users.count(function (err, users) {
       if (err) {
           res.send ('error getting users');
           
       }else{
       res.render('index', {userCount : users.length});
   }
   });
});


app.post('/user/register', function (req, res) {
    var newUser = new Users();
    newUser.hashed_password = req.body.password;
    newUser.email = req.body.email;
    newUser.name = req.body.fl_name;
    newUser.save(function(err){
        if (err){
            res.send('Unfortunately, we are not accepting new users at this time.')
        }else{
            res.redirect('/');
        }
        })
    
    console.log('The user has the email address' , req.body.email);
});
app.post('/user/login', function (req, res) {
    res.render('index');
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT);
});