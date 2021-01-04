function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

var usernameInvalid = getQueryVariable("u");
var emailInvalid = getQueryVariable("e");

if (usernameInvalid || emailInvalid) {
    var message = "The ";
    if (usernameInvalid) {
        message += "username";
    }

    if (emailInvalid) {
        if (usernameInvalid) {
            message += " and ";
        }

        message += "email";
    }

    message += " that you entered has been taken."

    alert(message)
}