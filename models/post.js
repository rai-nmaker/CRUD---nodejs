const mongoose = require('mongoose');

//Post Schema
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
});

const Post = module.exports = mongoose.model('Post', postSchema)