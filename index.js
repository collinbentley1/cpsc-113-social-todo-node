//Require// //Must Initialize MONGO_URL and SESSION_SECRET//

var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Users = require('./models/users.js');
var Tasks = require('./models/tasks.js');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
//Database for storing sessionIds on the server//

var store = new MongoDBStore({ 
    uri: process.env.MONGO_URL,
    collection: 'sessions'
      });


//Configure//
mongoose.connect(process.env.MONGO_URL);
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
  store: store
}));

app.use(function(req, res, next){
    if(req.session.userId){
       Users.findById(req.session.userId, function(err, user){
           if(!err){
               res.locals.currentUser = user;
           }
           next();
       });
    }else{
        next();
    }
});

//Define middleware to ensure that there is a user logged in before posting to form//

function isLoggedIn(req, res, next){
    
   if(res.locals.currentUser){
       next();
       
   }else{
    res.sendStatus(403);
}
}

//load user tasks//
function loadUserTasks(req, res, next) {
    if (!res.locals.currentUser){
        return next();
    }
    Tasks.find({}).or([
    {owner: res.locals.currentUser},
    {collaborators: res.locals.currentUser.email}])
    .exec(function(err, tasks){
        if(!err){
            res.locals.tasks = tasks;
        }
        next();
    });
}


//Above passes to one of the below//

app.get('/', loadUserTasks, function (req, res) {
      res.render('index');
      
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
        if (err){
            err = "Your registration could not be processed.";
            res.render('index',{errors: err});
        }else{
            req.session.userId = user._id;
            res.redirect('/');
        }
        });
    
});

app.get('/user/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});


app.post('/user/login', function (req, res) {
    var user = Users.findOne({email: req.body.email}, function(err, user){
        if(err || !user){
            res.send;
            return;
        }
        user.comparePassword(req.body.password, function (err, isMatch){
        if (err || !isMatch){
            res.send('Incorrect email or password.');

        }else{
        req.session.userId = user._id;
        res.redirect('/')  ;
        }
    });
    });
});


app.use(isLoggedIn);

app.post('/tasks/create', function (req, res){
    var newTask = new Tasks();
    newTask.owner = res.locals.currentUser._id;
    newTask.title= req.body.title;
    newTask.description=req.body.description;
    newTask.collaborators=[req.body.collaborator1, req.body.collaborator2, req.body.collaborator3];
    newTask.save(function(err, savedTask){
        if (err || !savedTask){
            res.send('Error saving task!');
            
        }else{
            res.redirect('/');
        
        }
    });

});

// initialize the server
app.listen(process.env.PORT, function () {
  console.log('Example app listening on port' + process.env.PORT);
});