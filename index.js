//Require// //Must Initialize MONGO_URL and SESSION_SECRET//

var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var Users = require('./models/users.js');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

//Database for storing sessionIds on the server//

var store = new MongoDBStore({ 
    uri: process.env.MONGO_URL,
    collection: 'sessions'
      });


//Configure//
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
  store: store
}))

app.use(function(req, res, next){
    if(req.session.userId){
       Users.findById(req.session.userId, function(err, user){
           if(!err){
               res.locals.currentUser = user;
           }
           next();
       })
    }else{
        next();
    }
})

//Above passes to one of the below//

app.get('/', function (req, res) {
   Users.count(function (err, users) {
       if (err) {
           res.send ('error getting users');
           
       }else{
       res.render('index', {
           userCount : users.length,
           currentUser: res.locals.currentUser


       });
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
    newUser.save(function(err, user){
        req.session.userId = user._id;
        if (err){
            res.render('index',{errors: err});
        }else{
            res.redirect('/');
        }
        })
    
});

app.get('/user/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
})


app.post('/user/login', function (req, res) {
    res.render('index');
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT);
});