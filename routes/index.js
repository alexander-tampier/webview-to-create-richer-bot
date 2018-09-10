const express = require('express');

const router = express.Router();

const { VERSION } = process.env;

// GET home page for the application
router.get('/', (req, res) => {
  res
    .status(200)
    .send(`webview-application-${VERSION}`);
});

module.exports = router;
