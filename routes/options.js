const express = require('express');

const router = express.Router();

// GET home page for the application
router.get('/', (req, res) => {
  const referer = req.get('Referer');

  console.log(`Req.query: ${JSON.stringify(req.query)} | Referer: ${referer}, | Dirname: ${__dirname}`);

  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.sendFile('../public/options.html', { root: __dirname });
  }
});

module.exports = router;
