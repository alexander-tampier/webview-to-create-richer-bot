// Imports dependencies and set up http server
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

const {
  PORT, PAGE_ACCESS_TOKEN, SERVER_URL, VERIFY_TOKEN,
} = process.env;

// Sets server port and logs message on success
app.listen(PORT || 1337, () => console.log(`Node app is running on port ${PORT}`));

/**
 * Sends response messages via the Send API
 * @param  {[type]} senderPsid [description]
 * @param  {[type]} response    [description]
 * @return {[type]}             [description]
 */
function callSendAPI(senderPsid, response) {
  // Construct the message body
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };
  console.log(requestBody);
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
}

/**
 * Define the template and webview
 * @param {[type]} senderPsid [description]
 * @return {[type]} [description]
 */
function setRoomPreferences() {
  const response = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text:
          "OK, let's set your room preferences so I won't need to ask for them in the future.",
        buttons: [
          {
            type: 'web_url',
            url: `${SERVER_URL}/options`,
            title: 'Set preferences',
            webview_height_ratio: 'compact',
            messenger_extensions: true,
          },
        ],
      },
    },
  };

  return response;
}

/**
 * Handles messages events
 * @param  {[type]} senderPsid      [description]
 * @param  {[type]} receivedMessage [description]
 * @return {[type]}                  [description]
 */
function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    switch (
      receivedMessage.text
        .replace(/[^\w\s]/gi, '')
        .trim()
        .toLowerCase()
    ) {
      case 'room preferences':
        response = setRoomPreferences();
        break;
      default:
        response = {
          text: `You sent the message: "${receivedMessage.text}".`,
        };
        break;
    }
  } else {
    response = {
      text: "Sorry, I don't understand what you mean.",
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

/**
 * handle postback event
 * @param  {[type]} senderPsid       [description]
 * @param  {[type]} receivedPostback [description]
 * @return {[type]}                   [description]
 */
function handlePostback(senderPsid, receivedPostback) {
  console.log('ok');
  let response;
  // Get the payload for the postback
  const { payload } = receivedPostback;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { text: 'Thanks!' };
  } else if (payload === 'no') {
    response = { text: 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}

// Serve the options path and set required headers
app.get('/options', (req, res) => {
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
    text: `Great, I will book you a ${body.bed} bed, with ${
      body.pillows
    } pillows and a ${body.view} view.`,
  };

  res
    .status(200)
    .send('Please close this window to return to the conversation thread.');
  callSendAPI(body.psid, response);
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
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

// Accepts POST requests at the /webhook endpoint
app.post('/webhook', (req, res) => {
  // Parse the request body from the POST
  const { body } = req;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      // Gets the body of the webhook event
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      const senderPsid = webhookEvent.sender.id;
      console.log(`Sender PSID: ${senderPsid}`);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});
