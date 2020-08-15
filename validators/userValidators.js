const { check } = require('express-validator')
const User = require('../models/User')

module.exports = {
    register : [
        check('email').notEmpty().isEmail().normalizeEmail().withMessage('Email field is required and must be type of email!'),
        check('email').custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                User.findOne({ email : value }, (err, res) => {
                    if(err) {
                        reject('This email is already exists')
                    }
                    if(res) {
                        reject('This email is already exists')
                    }
                    resolve('no user')
                })
            })
        }).withMessage('This email is already exists'),
        check('login').notEmpty().withMessage('Login field is required!'),
        check('login').custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                User.findOne({ login : value }, (err, res) => {
                    if(err) {
                        reject('This username is already exists')
                    }
                    if(res) {
                        reject('This username is already exists')
                    }
                    resolve('no user')
                })
            })
        }).withMessage('This username is already exists'),
        
        check('password').isLength(8).notEmpty().withMessage('Password field is required!'),
        check('rePassword').notEmpty().withMessage('Password confirmation field is required!'),
        check('rePassword').custom((value, { req }) => {
            if(value == req.body.password) {
                return true
            }
            return false
        }).withMessage('Passwords are not match!')
    ],

    login : [
        check('login').notEmpty().withMessage('Login is required'),
        check('password').notEmpty().withMessage('Password is required')
    ]
}