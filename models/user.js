const mongoose = require('mongoose');

const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const Podcast = require('./podcast');

const User = new Schema({
  name: String,
  email: String,
  podcasts: [Podcast.schema],
});

User.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

module.exports = mongoose.model('User', User);
