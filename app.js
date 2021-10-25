const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const bcrypt = require('bcryptjs');
const config = require('./config/database')
const passport = require('passport')

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.database);
const db = mongoose.connection;


const { check, validationResult } = require('express-validator');
const { matchedData, sanitize } = require('express-validator');




//check conn
db.once('open', () => {
    console.log('connected')
})
//check for db errors
db.on('error', (err) => {
    console.log(err);
})


//init  app
const app = express();

//bring in models
const Post = require('./models/post');



//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//set public folder
app.use(express.static(path.join(__dirname, 'public')));





// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));



//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});



//Passport config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

//home route
app.get('/', (req, res) => {
    Post.find({}, (err, posts) => {
        if(err){
            console.log(err);
        } else {
            res.render('index', {
                title: 'Posts',
                posts: posts
            });
        }
    })
});

//Route Files
let posts = require('./routes/posts');
let users = require('./routes/users');
app.use('/posts', posts)
app.use('/users', users)


//start server
const port = 3000;

app.listen(port, () => console.log(`Server started on ${port}`))