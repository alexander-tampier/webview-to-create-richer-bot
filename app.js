

// Imports dependencies and set up http server
const
  request = require('request');


const express = require('express');


const body_parser = require('body-parser');


const dotenv = require('dotenv').config();

const app = express();

app.set('port', process.env.PORT || 5000);
app.use(body_parser.json());
app.use(express.static('public'));

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SERVER_URL = process.env.SERVER_URL;
const APP_SECRET = process.env.APP_SECRET;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('Node app is running on port'));

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

// Serve the options path and set required headers
app.get('/options', (req, res, next) => {
  console.log(JSON.stringify(req.query));

  const referer = req.get('Referer');
  if (referer) {
    if (referer.indexOf('www.messenger.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    } else if (referer.indexOf('www.facebook.com') >= 0) {
      res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    }
    res.sendFile('public/options.html', { root: __dirname });
  }
});

// Handle postback from webview
app.get('/optionspostback', (req, res) => {
  const body = req.query;
  const response = {
    text: `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`,
  };

  res.status(200).send('Please close this window to return to the conversation thread.');
  callSendAPI(body.psid, response);
});

// Accepts POST requests at the /webhook endpoint
app.post('/webhook', (req, res) => {
  // Parse the request body from the POST
  const body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      // Gets the body of the webhook event
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      const sender_psid = webhook_event.sender.id;
      console.log(`Sender PSID: ${sender_psid}`);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.TOKEN;

  // Parse params from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


/**
 * Handles messages events
 * @param  {[type]} sender_psid      [description]
 * @param  {[type]} received_message [description]
 * @return {[type]}                  [description]
 */
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    switch (received_message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'room preferences':
        response = setRoomPreferences(sender_psid);
        break;
      default:
        response = {
          text: `You sent the message: "${received_message.text}".`,
        };
        break;
    }
  } else {
    response = {
      text: 'Sorry, I don\'t understand what you mean.',
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

/**
 * Define the template and webview
 * @param {[type]} sender_psid [description]
 * @return {[type]} [description]
 */
function setRoomPreferences(sender_psid) {
  const response = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: "OK, let's set your room preferences so I won't need to ask for them in the future.",
        buttons: [{
          type: 'web_url',
          url: `${SERVER_URL}/options`,
          title: 'Set preferences',
          webview_height_ratio: 'compact',
          messenger_extensions: true,
        }],
      },
    },
  };

  return response;
}

/**
 * Sends response messages via the Send API
 * @param  {[type]} sender_psid [description]
 * @param  {[type]} response    [description]
 * @return {[type]}             [description]
 */
function callSendAPI(sender_psid, response) {
  // Construct the message body
  const requestBody = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };
  console.log(requestBody);
  // Send the HTTP request to the Messenger Platform
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: requestBody,
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error(`Unable to send message:${err}`);
    }
  });
}
