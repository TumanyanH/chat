const express = require('express')
const Router = express.Router()

const authController = require('../controllers/authController')

/**
 * form validators
 */
const userValidator = require('../validators/userValidators')
const User = require('../models/User')
const Chat = require('../models/Chat')

Router.get('/', async (req, res, next) => {
    if(req.session.user) {
        const chats = await Chat.find({ 
            $or : [
                { from : req.session.user._id },
                { to : req.session.user._id }
            ] 
        })
        let chatRoomnames = chats.map(chat => {
            return chat.roomname.split('-').filter(login => {
                if(login == req.session.user.login) {
                    return false
                }
                return true
            })
        })

        chatRoomnames = chatRoomnames.map(name => {
            return name[0]
        })
        
        chatRoomnames = [...new Set(chatRoomnames)]

        const chatters = await User.find({ login : { $in : chatRoomnames } })

        console.log(chatters);

        return res.render('index', {
            title : "Chat",
            chats : chatters
        })
    } else {
        return res.redirect('/login')
    }
})

Router.get('/login', (req, res, next) => {
    if(req.session.user) {
        return res.redirect('/')
    } else {
        return res.render('login', {
            title : "Login"
        })
    }
})

Router.get('/register', (req, res, next) => {
    if(req.session.user) {
        return res.redirect('/')
    } else {
        return res.render('register', {
            title : "Register"
        })
    }
})

Router.post('/register', userValidator.register, authController.register)

Router.post('/login', userValidator.login, authController.login)

Router.get('/confirm-account/:token', authController.confirmAccount)

Router.get('/logout', authController.logout)

module.exports = Router