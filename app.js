//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save((err) => {
            console.log('Successfully registered');
            res.render('secrets');
        });
    });
    
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            if(foundUser) {
                bcrypt.compare(password, foundUser.password).then(function(result) {
                    if(result === true) {
                        console.log('Successfully logged in: ' + username);
                        res.render('secrets');
                    } else {
                        console.log('Incorrect login details');
                        res.render('login');
                    }
                });
                
            } else {
                console.log('No user found');
                res.redirect('/');
            }
            
        }
    });


});

app.listen(port, () => {
    console.log('Server started on port ' + port);
});