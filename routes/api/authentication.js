const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../../models/user');

mongoose.Promise = global.Promise;
const router = express.Router();

router.post('/register', (req, res) => {
  const {
    username, firstName, lastName, email,
  } = req.body;
  const newUser = new User({
    username,
    firstName,
    lastName,
    email,
  });

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      return res.send(JSON.stringify({ error: err }));
    }
    return res.send(JSON.stringify(user));
  });
});

router.post('/login', async (req, res) => {
  const foundUser = await User.findOne({
    email: req.body.email,
  }).exec();

  if (foundUser) {
    req.body.username = foundUser.username;
  }

  passport.authenticate('local')(req, res, () => {
    if (req.user) {
      return res.send(JSON.stringify(req.user));
    }
    return res.send(JSON.stringify({ error: 'There was an error logging in' }));
  });
});

router.get('/checksession', (req, res) => {
  if (req.user) {
    return res.send(JSON.stringify(req.user));
  }
  return res.send(JSON.stringify({}));
});

router.get('/logout', (req, res) => {
  req.logout();
  return res.send(JSON.stringify(req.user));
});

module.exports = router;
