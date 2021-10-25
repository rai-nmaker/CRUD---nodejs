const express = require('express')
const router = express.Router();
const bcrpyt = require('bcryptjs');
const passport = require('passport')

const { check, validationResult } = require('express-validator');
const { matchedData, sanitize } = require('express-validator');


//bring in Post models
const User = require('../models/user');

// Register Form 
router.get('/register', function(req, res){
    res.render('register');
})



//Register Process

router.post('/register',

    (req,res,next)=>{
        [
            check('email').isLength({min:1}).trim().isEmail().withMessage('Email required'),
            check('username').isLength({min:1}).trim().withMessage('username required'),
            check('password').isLength({min:1}).trim().withMessage('password required'),
            // check('email', 'Email required').notEmpty(),
            // check('username', 'Username required').isEmail(),
            // check('password', 'Password required').notEmpty(),
            check('password2').isLength({min:1}).trim().withMessage('Password do not match').equals(req.body.password)
        ];

    const user = new User({
    email:req.body.email,
    username:req.body.username,
    password:req.body.password,
    password2:req.body.password2,
});

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
    console.log(errors);
    res.render('register',
{ 
    //user:user,
    errors: errors.mapped()
    });
    }
    else{
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;

    user.save(err=>{
    if(err)throw err;
    req.flash('success','Acount Created');
    res.redirect('/users/login');
    });

    bcrpyt.genSalt(10, function(err, salt){
        bcrpyt.hash(user.password, salt, function(err, hash){
            if(err){
                console.log(err);
            }
            user.password = hash;
            user.save(function(err){
                if(err){
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'YOu are now registered')
                    res.redirect('/users/login');
                }
            })
        })
    })
}
    })



//Login Form
    router.get('/login', function(req, res){
        res.render('login');
    });

//Login Process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;