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
    if (req.body.password !== req.body.password_confirmation){
        return res.render('index', {errors: "Your password and password confimation do not match."});
    }
    var newUser = new Users();
    newUser.hashed_password = req.body.password;
    newUser.email = req.body.email;
    newUser.name = req.body.fl_name;
    newUser.save(function(err){
        if (err){
            res.render('index',{errors: err});
        }else{
            res.redirect('/');
        }
        })
    
});
app.post('/user/login', function (req, res) {
    res.render('index');
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT);
});