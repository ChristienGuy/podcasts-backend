const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { parseString } = require('xml2js');

const Podcast = require('../../models/podcast');
const User = require('../../models/user');

mongoose.Promise = global.Promise;
const router = express.Router();

function getEpisodes(episodeData) {
  const episodes = episodeData.map((episode) => {
    const {
      title,
      pubDate,
      'itunes:image': image,
      description,
      'itunes:duration': duration,
      link,
    } = episode;

    return {
      title: title[0],
      pubDate: pubDate[0],
      image: image[0].$,
      description: description[0],
      duration: duration ? duration[0] : '',
      link: link[0],
    };
  });
  return episodes;
}

async function getPodcast(rssUrl) {
  let podcast = {};
  await axios
    .get(rssUrl, {
      responseType: 'text',
    })
    .then((res) => {
      parseString(res.data, (err, result) => {
        const {
          title,
          image,
          link: webLink,
          'atom:link': rssLink,
          item: episodes,
        } = result.rss.channel[0];

        podcast = {
          title: title[0],
          image: {
            url: image[0].url[0],
            title: image[0].title[0],
            link: image[0].link[0],
          },
          webUrl: webLink[0],
          rssUrl: rssLink[0].$.href,
          episodes: getEpisodes(episodes),
        };
      });
    })
    .catch(err => new Error(`Error: ${err}`));

  return podcast;
}

router.post('/add', async (req, res) => {
  const { url } = req.body;
  let podcast = {};

  if (req.user) {
    try {
      const user = await User.findOne(req.user._id).exec();
      podcast = await user.podcasts.find(p => p.rssUrl === url);
      if (!podcast) {
        podcast = await getPodcast(url);
        Podcast.create(podcast, (err) => {
          if (err) {
            // TODO: error handle
            return res.status(500).send('Error adding podcast');
          }
          user.podcasts.push(podcast);
          user.save();
        });
      }
      return res.send(JSON.stringify(podcast));
    } catch (err) {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
      return res.status(500).send('Internal Error');
    }
  }
  return res.status(403).send('No user');
});

// /get
// /get/:id

module.exports = router;
