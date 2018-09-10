const setRoomPreferences = require('./send');
const callSendAPI = require('./sendToApi');

/**
 * handles messageEvents
 * @param  {[type]} senderPsid      [description]
 * @param  {[type]} receivedMessage [description]
 * @param  {[type]} serverUri       [description]
 * @return {[type]}                 [description]
 */
const handleMessage = (senderPsid, receivedMessage, serverUri) => {
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
        response = setRoomPreferences(serverUri);
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
};

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

module.exports = {
  handleMessage,
  handlePostback,
};
