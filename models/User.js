const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema({
    email : {
        type : String,
        required : true
    },
    login : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    token : {
        type : String,
        required : true
    },
    verified : {
        type : Number,
        default : 0
    }
}, {timestamps : true})

module.exports = mongoose.model('User', userSchema)