const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = Schema({
    roomname : {
        type : String,
        required : true
    },
    from : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    to : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    seen : {
        type : Boolean,
        default : false
    },
    sent : {
        type : Date,
        default : new Date().toISOString()
    },
    message : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('Chat', chatSchema)