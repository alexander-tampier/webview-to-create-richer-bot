/* eslint-disable */
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = () => {
  // TODO: How to parse env file from here?
  MessengerExtensions.getSupportedFeatures(function success(result) {
    let features = result.supported_features;
    if (features.includes("context")) {
      MessengerExtensions.getContext('388352654935309', function success(thread_context) {
        // success
        console.log('ThreadContext: ' + JSON.stringify(thread_context));
        document.getElementById("psid").value = thread_context.psid;
      }, function error(err) {
        // error
        console.log(err);
      });
    }
  }, function error(err) {
    // error retrieving supported features
    console.log(err);
  });

  // Call /optionspostback and submit all values out of the form
  document.getElementById('submitButton').addEventListener('click', () => {

    const pillowsSelect = $('select#pillows-select').val();
    const bedSelect = $('select#bed-select').val();
    const viewSelect = $('select#view-select').val();

    console.log(`Pillow: ${pillowsSelect}, Bed: ${bedSelect}, View: ${viewSelect}`);

    $.get('/optionspostback', {
      'pillows': pillowsSelect,
      'bed': bedSelect,
      'view': viewSelect,
    });

    MessengerExtensions.requestCloseBrowser(function success() {
      console.log("Webview closing");
    }, function error(err) {
      console.log(err);
    });
  });
};

$(document).ready(function() {
  $('select').formSelect();
});
