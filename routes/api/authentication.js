const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../../models/user');

mongoose.Promise = global.Promise;
const router = express.Router();

router.post('/register', (req, res) => {
  const {
    name, email,
  } = req.body;
  const newUser = new User({
    name,
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
  req.session.destroy();
  req.logout();
  return res.send(JSON.stringify(req.user));
});

module.exports = router;
