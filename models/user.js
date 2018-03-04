const mongoose = require('mongoose');

const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const Episode = new Schema({
  title: String,
  lastPlayedPosition: Number,
});

const Podcast = new Schema({
  title: String,
  episodes: [Episode],
});


const User = new Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  podcasts: [Podcast],
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
