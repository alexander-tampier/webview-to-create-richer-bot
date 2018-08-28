/* eslint-disable */
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = () => {
    $('select').formSelect();
    // TODO: How to parse env file from here?
    MessengerExtensions.getSupportedFeatures(function success(result) {
        let features = result.supported_features;
        if (features.includes("context")) {
            MessengerExtensions.getContext('388352654935309',
                function success(thread_context) {
                    // success
                    console.log('ThreadContext: ' + JSON.stringify(thread_context));
                    document.getElementById("psid").value = thread_context.psid;
                },
                function error(err) {
                    // error
                    console.log(err);
                }
            );
        }
    }, function error(err) {
        // error retrieving supported features
        console.log(err);
    });

    // Call /optionspostback and submit all values out of the form
    document.getElementById('submitButton').addEventListener('click', () => {

        var instance = M.FormSelect.getInstance($('#view-select'));
        var _d = instance.getSelectedValues();
        console.log(_d);

        MessengerExtensions.requestCloseBrowser(function success() {
            console.log("Webview closing");
        }, function error(err) {
            console.log(err);
        });
    });
};

/*
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, {});

});
*/
/*
$(document).ready(function () {
    $('select').formSelect();   
});
*/



function sendRequest() {
    /* JQuery Working 
    
    var instance = M.FormSelect.getInstance($('#view-select'));
    var _d = instance.getSelectedValues();
    console.log(_d);
    */


    /*
    var elem = document.getElementById('view-select');
    var instance = M.FormSelect.getInstance(elem);
    console.log(instance.getSelectedValues());
    */

    /*
    var pillowSelect = document.getElementById('pillows-select').M_FormSelect.input.value;
    var bedSelect = document.getElementById('bed-select').M_FormSelect.input.value;
    var viewSelect = document.getElementById('view-select').M_FormSelect.input.value;

    var response = {
        pillowSelect,
        bedSelect,
        viewSelect,
    };

    console.log(response);
    */
}
