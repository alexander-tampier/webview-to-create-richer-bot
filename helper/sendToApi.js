const request = require('request');

const { PAGE_ACCESS_TOKEN } = process.env;

/**
 * Sends response messages via the Send API
 * @param  {[type]} senderPsid [description]
 * @param  {[type]} response    [description]
 * @return {[type]}             [description]
 */
const callSendAPI = (senderPsid, response) => {
  // Construct the message body
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  console.log(`Message that will be send: ${JSON.stringify(requestBody)}`);

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
      },
      method: 'POST',
      json: requestBody,
    },
    (err) => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error(`Unable to send message:${err}`);
      }
    },
  );
};

module.exports = callSendAPI;
