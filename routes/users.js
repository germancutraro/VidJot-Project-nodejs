const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

  router.get('/login', (req, res) => {
    res.render('users/login', {error: ''});
  });

  router.get('/register', (req, res) => {
    res.render('users/register', {
      errors: [],
      name: '',
      email: '',
      password: '',
      rpassword: ''
    });
  });

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
  });

  router.post('/register', (req, res) => {
    let errors = [];

    if (req.body.password != req.body.rpassword)
      errors.push({text: 'Password do not match'});
    if (req.body.password.length <4 )
      errors.push({text: 'Password must be at least 4 characters!'});
    // verify if errors exist
    if (errors.length > 0) {
      res.render('users/register', {
        errors,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        rpassword: req.body.rpassword
      });
    }  else {
      User.findOne({email: req.body.email}).then(user => {
        if (user) {
          errors.push({text: 'User already exist!'});
          res.render('users/register', {errors, name: '', email: '', password: '', rpassword: ''});
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save().then( user => {
                console.log(`User ${user.name} register!`);
                res.redirect('/users/login');
              }).catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/ideas',
      failureRedirect: '/users/login'
    })(req, res, next);
  });

module.exports = router;
