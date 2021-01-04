function accessCookie(cookieName) {
    var name = cookieName + "=";
    var allCookieArray = document.cookie.split(';');
    for (var i = 0; i < allCookieArray.length; i++) {
        var temp = allCookieArray[i].trim();
        if (temp.indexOf(name) == 0)
            return temp.substring(name.length, temp.length);
    }
    return "";
}

if (username != null && username.length > 0) {
    // Email parameter exists in the url so the index must have been re-directed from the register page
    var cookieString = "username="+username;
    document.cookie = cookieString;
    console.log(" WROTE COOKIE ");
   
    showUsername(username);
} else {
    var username = accessCookie("username");
    
    showUsername(username)
}

