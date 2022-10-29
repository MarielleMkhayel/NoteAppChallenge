const express = require('express');

const {body} = require('express-validator');

const authControllers = require('../controllers/auth')

const User = require('../models/user');

const router = express.Router();

router.put('/signUp',[
    body('email', 'Please enter a valid email')
    .isEmail()
    .custom((value, {req}) => { //to check whether the email already exists
        return User.findOne({email: value}).then(userDoc => {
            if (userDoc){
                return Promise.reject('email already exists');
            }
        })
    })
    .normalizeEmail(),
    body('password', 'Password must be more than 5 characters')
    .isLength({min: 5})
    .trim(),
    body('name', "Please enter a valid name")
    .trim()
    .not()
    .isEmpty()

] ,authControllers.signUp);

router.post('/login', authControllers.login);

module.exports = router;