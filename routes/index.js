const express = require('express');

const router = express.Router();

// GET home page for the application
router.get('/', (req, res) => {
  res
    .status(200)
    .send('webview-application-v0.1');
});

module.exports = router;
