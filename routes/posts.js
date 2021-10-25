const express = require('express')
const router = express.Router();

const { check, validationResult } = require('express-validator');
const { matchedData, sanitize } = require('express-validator');

 
//bring in Post models
const Post = require('../models/post');
//User model
const User = require('../models/user');





//Add Route
router.get('/add', ensureAuthentication, (req, res) => {
    res.render('add_post', {
        title: 'Add Post'
    });
})


//add submit POST route
router.post('/add',
    //validator express
    [
        check('title').isLength({min:1}).trim().withMessage('Title required'),
        // check('author').isLength({min:1}).trim().withMessage('Author required'),
        check('body').isLength({min:1}).trim().withMessage('Body required')
    ],
        (req,res,next)=>{
    
        let post = new Post({
        title:req.body.title,
        author:req.body.author,
        body:req.body.body
    });
    
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
        console.log(errors);
        res.render('add_post',
        { 
        post:post,
        errors: errors.mapped()
        });
        }
        else {
        post.title = req.body.title;
        post.author = req.body._id;
        post.body = req.body.body;
    
        post.save(err=>{
        if(err)throw err;
        req.flash('success','Post Added');
        res.redirect('/');
        });
    }
})



//Load Edit Form
router.get('/edit/:id', ensureAuthentication, (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(post.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        res.render('edit_post', {
            title: 'Edit Article',
            post:post
        });
    });
});



//Update submit POST route/ EIT
router.post('/edit/:id', (req, res) => {
    const post = {};
    title = req.body.title;
    author = req.body.author;
    body = req.body.body;


    const query = {_id:req.params.id}

    Post.updateOne(query, post, function(err){
        if(err){
            console.log(err);
            return;
        }else {
            req.flash('success', 'Post Updated')
            res.redirect('/');
        }
    });
});

//Delete
router.delete('/:id', (req, res) =>  {
    if(!req.user._id){
        res.status(500).send();
    }

    const query = {_id:req.params.id}

    Post.findById(req.params.id, function(err, post){
        if(post.author != req.user._id){
            return res.status(500).send();
        } else {

            Post.remove(query, (err) => {
                if(err){
                    console.log(err);
                }
                res.send('success')
            });

        }
    })  
})

//GET single post
router.get('/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        //const User = require('../models/user');
        //post.author = req.user._id;
        User.findById(post.author, (err, user) => {
            res.render('post', {
                post:post,
                author: user.username,
            });
        });
    });
});

// ACcess Control
function ensureAuthentication(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please login')
        res.redirect('/users/login')
    }
}




module.exports = router;