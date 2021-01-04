var activeUsername;
var activeEmail;


var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require('path');

var client_id = 'ce2e7c5bba08408683a80e8ed7f618f6'; // Your client id
var client_secret = '4b8d3b999a9c423baafed4ef43b808da'; // Your secret
var redirect_uri = 'http://localhost:8080/callback/'; // Your redirect uri
//var redirect_uri = 'https://spark-adios-8080.codio.io/callback/'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(express.static(path.join(__dirname, '../')))
    .use(cors())
    .use(cookieParser());

app.use(express.static('public'));

const bodyParser = require('body-parser'); //Use body parser for parsing text.
app.use(bodyParser.urlencoded({extended:true}));

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/maptracks";

var db;
MongoClient.connect(url, function(err, database) {
    if (err) console.log(" ===== MONGODB ERROR =====");
    db = database;
    console.log("Database connected");
});

app.post('/register', function(req, res) {
    try {
        var attemptEmail = req.body.email;
        var attemptUsername = req.body.username;

        db.collection('users').find().toArray(function(err, result) {
            if (err) throw err;

            var emailError = false;
            var usernameError = false;

            for (var i = 0; i != result.length; i++) {
                if (attemptEmail === result[i].email && !emailError) {
                    emailError = true;
                }

                if (attemptUsername === result[i].username && !usernameError) {
                    usernameError = true;
                }
            }

            if (emailError || usernameError) {
                var mRedirectUrl = '/register.html?';

                if (emailError) {
                    mRedirectUrl += "e=true";
                }

                if (usernameError) {
                    if (emailError) mRedirectUrl += "&";
                    mRedirectUrl += "u=true";
                }

                res.redirect(mRedirectUrl);
            } else {
                try {
                    console.log(req.body.email);
                    db.collection('users').save(req.body,function(err, result) {
                        if (err) throw err;
                        console.log('saved to database');

                        activeUsername = req.body.username;
                        activeEmail = req.body.email;

                        console.log(" User logged in --" +activeEmail + "--");

                        res.redirect('/index.html?u='+activeUsername);
                    });
                } catch (e) {
                    console.log(" Error saving to database " + e);
                    res.redirect('/register.html')
                }
            }
        });
    } catch (e) {
        console.log(" Error accessing database");
        res.redirect('/');
    }
});

app.post('/log_in', function(req, res) {
    var attemptEmail = req.body.email;
    var attemptPassword = req.body.password;
    var loggedIn = false;
    try {
        db.collection('users').find().toArray(function(err, result) {
            if (err) throw err;
            for (var i = 0; i != result.length; i++) {
                if (attemptEmail === result[i].email && attemptPassword === result[i].pw) {
                    // user entered a username and password that exists in the database
                    activeEmail = attemptEmail;
                    activeUsername = result[i].username;
                    loggedIn = true;
                    console.log(" User logged in --" +attemptEmail + "--");
                }
            }
            if (loggedIn) {
                res.redirect('/index.html?u='+activeUsername);
            } else {
                res.redirect('/login.html?incorrect')
            }
        });
    } catch (e) {
        console.log(" Error accessing database");
        res.redirect('/');
    }
});

app.get('/logout', function(req, res) {
    console.log(" User logged out --" + activeEmail + "--");

    activeEmail = "";
    activeUsername = "";

    res.redirect('/login.html');
});


app.post('/change_password', function(req, res) {
    try {
        var query = { "username": activeUsername };
        var newvalues = { $set: {"pw": req.body.pw} };
        db.collection("users").updateOne(query, newvalues, function(err, r) {
           //if (err) throw err;
            console.log(" Password changed")
            res.redirect('/');
        });
    } catch (e) {
        console.log(" Error when changing password - "+e);
        res.redirect('/');
    }
});


//requests authorisation to link to Spotify account
app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization

    var scope = 'user-read-private user-read-email user-modify-playback-state playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
    res.redirect('back');
});

//redirects from the Spotify Authorization page to the site
app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;
                var time = new Date();
                var id = "";
                var accessTokenTime = time.getUTCHours() + "-" + time.getMinutes() + "-" + time.getSeconds();
                console.log("\n" + access_token);
                console.log("\n" + refresh_token);
                console.log(time);
                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {'Authorization': 'Bearer ' + access_token},
                    json: true,
                };
                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                    //moved this from underneath the request to here -> this may cause issues later on
                    res.redirect('/?' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token,
                            time: accessTokenTime,
                            id: body.id,
                        }));
                });

                // we can also pass the token to the browser to make requests from there
                //res.redirect was here
            } else {
                res.redirect('/?' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

//refresh the access token using the refresh token from url
app.get('/refresh_token', function(req, res) {
    var url = req.url;
    url = url.split("=");
    var refresh_token = url[1];
    var id = url[2];
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            time: accessTokenTime,
            id: id
        },
        json: true
    };
    console.log(refresh_token);
    request.post(authOptions, function(error, response, body) {
        console.log(response.statusCode); //400 bad request
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            var time = new Date();
            var accessTokenTime = time.getHours() + "-" + time.getMinutes() + "-" + time.getSeconds();
            res.redirect('/?' + querystring.stringify({
                access_token: access_token,
                time: accessTokenTime
            }));

            console.log(access_token);
        }
    });
});
//select which port for the site to listen to
console.log('Listening on 8080');
app.listen(8080);
