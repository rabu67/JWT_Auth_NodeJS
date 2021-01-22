const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');
const dotenv = require('dotenv').config();

//handle errors
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };
    //incorrect email
    if(err.message === 'Incorrect email'){
        errors.email = 'Entered email is not registered!';
    }

    //incorrect password
    if(err.message === 'Incorrect Password'){
        errors.password = 'Password is incorrect!';
    }

    //duplicate email checking
    if(err.code === 11000) {
        errors.email = 'The entered email is already exists!';
        return errors;
    }

    //validate errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60; //3 days
//create jwt token
const createToken = (id) => {
    return jwt.sign({ id }, 'rajbabu secret', { 
        expiresIn: maxAge
     });
}

module.exports.signup_get = (req,res) => {
    res.render('signup');
}

module.exports.signup_post = async (req,res) => {
    const { email,password } = req.body;

    try {
       const user = await User.create({ email, password });
       const token = createToken(user._id); //mangoDb uses _ as prefix for id
       //saving token to browser cookie
       res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); 
       res.status(201).json({user: user._id});
    } catch (error) {
        const errors = handleError(error);
        res.status(400).json({errors});
    }
}

module.exports.login_get = (req,res) => {
    res.render('login');
}

module.exports.login_post = async (req,res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id); //mangoDb uses _ as prefix for id
        //saving token to browser cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({ user: user._id}); 
    } catch (error) {
        const errors = handleError(error);
        res.status(400).json({errors});
    }
}

module.exports.logout_get = (req,res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}