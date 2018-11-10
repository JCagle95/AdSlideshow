function removeFunction(element) {
  post('/administration/removeItem', {id: element});
}

function editFunction(element) {
  post('/administration/editItem', {id: element});
}

function editInstitute(element) {
  post('/administration/editInstitute', {id: element});
}

function removeInstitute(element) {
  post('/administration/removeInstitute', {id: element});
}

function switchUser(name, element) {
  post('/administration/switchUser', {name: name, id: element});
}

function sendTelemetry(id) {
  var date = new Date()
  post('/administration/analytics/telemetry', {id: id, currentDate: date.toDateString() });
}

// Huge thanks to Rakesh Pai for sharing this solution
function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
