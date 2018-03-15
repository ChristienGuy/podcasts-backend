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
      'itunes:summary': summary,
      'itunes:duration': duration,
      enclosure,
    } = episode;

    return {
      title: title[0],
      pubDate: pubDate[0],
      imageUrl: image ? image[0].$.href : '',
      description: description ? description[0] : summary[0],
      duration: duration ? duration[0] : '',
      enclosure: enclosure
        ? {
          url: enclosure[0].$.url,
          type: enclosure[0].$.type,
          length: enclosure[0].$.length,
        }
        : {},
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
          'itunes:image': image,
          link: webLink,
          'atom:link': atomLinks,
          'atom10:link': atom10Links,
          item: episodes,
        } = result.rss.channel[0];

        let atomLink = null;
        if (atomLinks) {
          atomLink = atomLinks.filter((tmpLink) => {
            console.log('====================================');
            console.log(tmpLink);
            console.log('====================================');
            return tmpLink.$.type === 'application/rss+xml';
          });
        } else if (atom10Links) {
          atomLink = atom10Links.filter(tmpLink => tmpLink.$.type === 'application/rss+xml');
        }


        podcast = {
          title: title[0] ? title[0] : title,
          imageUrl: image[0].$.href,
          webUrl: webLink[0],
          rssUrl: atomLink[0].$.href,
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
      const user = await User.findOne(req.user._id).exec(); // eslint-disable-line no-underscore-dangle
      podcast = await user.podcasts.find(p => p.rssUrl === url);
      if (!podcast) {
        podcast = await getPodcast(url);
        if (podcast) {
          Podcast.create(podcast, (err) => {
            if (err) {
              // TODO: error handle
              return res.status(500).send('Error adding podcast');
            }
            user.podcasts.push(podcast);
            return user.save();
          });
        } else {
          return res.status(500).send('Error adding podcast');
        }
      }
      return res.send(JSON.stringify(podcast));
    } catch (err) {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
      return res.status(500).send('Internal Error');
    }
  }
  return res.status(403).send('no user');
});

router.get('/update', async (req, res) => {
  if (req.user) {
    try {
      const user = await User.findOne(req.user._id).exec(); // eslint-disable-line no-underscore-dangle

      const podcastPromises = user.podcasts.map(podcast => getPodcast(podcast.rssUrl));
      const podcastsObjects = await Promise.all(podcastPromises);

      const updatedPodcasts =
        await Promise.all(podcastsObjects.map(podcast => Podcast.create(podcast)));

      user.podcasts = [];
      user.podcasts.push(...updatedPodcasts);
      user.save((err) => {
        console.log('====================================');
        console.log(err);
        console.log('====================================');
      });
      return res.status(200).send(JSON.stringify(updatedPodcasts));
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  }
  return res.status(403).send('no user');
});

// /get
// /get/:id

module.exports = router;
