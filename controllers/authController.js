const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const randomString = require('crypto-random-string')

const User = require('../models/User')
const mailSender = require('../util/helpers/emailSenderHelper')

module.exports = {
    register : async (req, res, next) => {
        const login = req.body.login
        const email = req.body.email
        const password = req.body.password

        const errors = validationResult(req)

        if(errors.isEmpty()) {
            try {
                const bcryptSalt = await bcrypt.genSalt(parseInt(process.env.HASH_SALT))
                const passwordHash = await bcrypt.hash(password, bcryptSalt)
                const newUser = await User.create({
                    login : login,
                    email : email,
                    password : passwordHash,
                    token : randomString({ length : 32 })
                })
                await mailSender(
                    email, 
                    'Chatter app account verification e-mail',
                    `Please click here to <a style="color : blue;" href="${process.env.DEFAULT_DOMAIN_NAME}/confirm-account/${newUser.token}">activate your email</a>`
                )

                return res.redirect('/login')
            } catch(err) {
                next(err)
            }
        } else {
            return res.render('register', {
                title : "Register",
                errorMessages : errors.array()
            })
        }
    },

    confirmAccount : async (req, res, next) => {
        const token = req.params.token

        try {
            const user = await User.findOne({ token : token })
            user.verified = 1
            await user.save()
            return res.render('confirmed', {
                title : 'Your email is confirmed'
            })
        } catch(err) {
            next(err)
        }
    },

    login : async (req, res, next) => {
        const login = req.body.login
        const password = req.body.password

        const errors = validationResult(req)

        if(errors.isEmpty()) {
            try {
                const user = await User.findOne({ login : login })
                if(user) {
                    const isMatch = await bcrypt.compare(password, user.password)
                    if(isMatch) {
                        req.session.user = user
                        return res.redirect('/')
                    }
                }
                return res.render('login', {
                    title : 'Login',
                    errorMessages : [{
                        msg : "Incorrect login/password!"
                    }]
                })
            } catch(err) {
                next(err)
            }
        } else {
            return res.render('login', {
                title : 'Login',
                errorMessages : errors.array()
            })
        }
    },

    logout : (req, res, next) => {
        delete req.session.user
        return res.redirect('/login')
    }
}