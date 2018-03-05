const mongoose = require('mongoose');

const { Schema } = mongoose;

const Episode = new Schema({
  title: String,
  pubDate: Date,
  image: Object,
  description: String,
  duration: String,
  link: String,
  // lastPlayedPosition: Number,
});

const Podcast = new Schema({
  title: String,
  image: Object,
  webUrl: String,
  rssUrl: String,
  episodes: [Episode],
});

module.exports = mongoose.model('Podcast', Podcast);
