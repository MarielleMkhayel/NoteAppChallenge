const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: ''
    }
}));

exports.signUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error= new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt
    .hash(password, 12)
    .then( hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });
        return user.save()
    })
    .then(result => {
        res
        .status(201) //a resource was created
        .json({message: 'User Created successfully', userId: result._id})
    })
    .then( result => {
        // return transporter.sendMail({
        //     to: email,
        //     from: '',
        //     subject: 'SignUp Succeded!',
        //     html: '<h1>Welcome to our Notes Application!</h1>'
        // });
    })
    .catch( err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);  
    })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User
    .findOne({email: email})
    .then(user => {
        if (!user){
            const error = new Error('User not found');
            error.statusCode = 401; //not authenticated
            throw error;
        }
        loadedUser = user;
        return bcrypt
        .compare(password, user.password);
    })
     .then( isEqual => {
        if (!isEqual){
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email, 
            userId: loadedUser._id.toString()
        }, 'secret', {expiresIn: '1h'} //signing in expires in 1 hour
        );
        res.status(200).json({message: "Successfully logged in",token: token, userId: loadedUser._id.toString()})
     })
    .catch( err => {
        if (!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);  
    })
}