const { SERVER_URL } = process.env;

/**
 * Define the template and webview
 * @param {[type]} senderPsid [description]
 * @return {[type]} [description]
 */
const setRoomPreferences = () => {
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
};

module.exports = setRoomPreferences;
