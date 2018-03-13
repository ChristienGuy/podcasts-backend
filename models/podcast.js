const mongoose = require('mongoose');

const { Schema } = mongoose;

const Episode = new Schema({
  title: String,
  pubDate: Date,
  imageUrl: String,
  description: String,
  duration: String,
  enclosure: Object,
  // lastPlayedPosition: Number,
});

const Podcast = new Schema({
  title: String,
  imageUrl: String,
  webUrl: String,
  rssUrl: String,
  episodes: [Episode],
});

module.exports = mongoose.model('Podcast', Podcast);
