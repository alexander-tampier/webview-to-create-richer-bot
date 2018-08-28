const express = require('express');
const callSendAPI = require('../helper/sendToApi');

const router = express.Router();

router.get('/', (req, res) => {
  const body = req.query;
  const response = {
    text: `Great, I will book you a ${body.bed} bed, with ${
      body.pillows
    } pillows and a ${body.view} view.`,
  };

  res
    .status(200)
    .send('Please close this window to return to the conversation thread.');
  callSendAPI(body.psid, response);
});

module.exports = router;
