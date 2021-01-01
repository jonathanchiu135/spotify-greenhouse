const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const defaultRoutes = require('./routes/defaultRoutes')

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = 'http://localhost:5000/callback'; 

/*Random String Generator: has length "length" */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
  
var stateKey = 'spotify_auth_state';

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.listen(5000);
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


//routes
app.use('/', defaultRoutes);

//initial login GET call - passes in scopes, etc.
app.get('/login', function(req, res) {

    //generate a random state string; spotify should send this same one back
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // request authorization, using these properties in the URL
    var scope = 'user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});

//callback function - spotify calls this after authorizing access
app.get('/callback', function(req, res) {

    // use authorization code to request refresh and access tokens
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    //check the state to make sure it's the same as the sent one
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      //after checking, we don't need the state anymore
      res.clearCookie(stateKey);

      //request the tokens, using our authorization code
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
      
      //send this authorization-code-object
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            
          //we have now obtained the access and refresh tokens
          var access_token = body.access_token,
              refresh_token = body.refresh_token;
        
          //use this access token to make get requests from the Spotify Web API
          //place the API call within a promise so you can access the body after making GET request to Spotify

          const apiCall1 = () => {
            return new Promise((resolve, reject) => {
              var options = {
                    url: 'https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=short_term',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
              };
              request.get(options, function(error, res, body) {
                    if (error) reject(error);
                    resolve(body);
              });
            });
          }
  
          const apiCall2 = () => {
            return new Promise((resolve, reject) => {
              var options = {
                    url: 'https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=medium_term',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
              };
              request.get(options, function(error, res, body) {
                    if (error) reject(error);
                    resolve(body);
              });
            });
          }
          const apiCall3 = () => {
            return new Promise((resolve, reject) => {
              var options = {
                    url: 'https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=long_term',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
              };
              request.get(options, function(error, res, body) {
                    if (error) reject(error);
                    resolve(body);
              });
            });
          }
          apiCall1().then((body1) => {
            apiCall2().then((body2) => {
              apiCall3().then((body3) => {
                res.render('menu_callback', {bodyInput1: body1, bodyInput2: body2, bodyInput3: body3});
              }) .catch((err) => console.log(err));
            }) .catch((err) => console.log(err));
          }) .catch((err) => console.log(err));
  
        } else {
          res.redirect('/error');
        }
      });
    }
});

//if we ever want to use the refresh token to get a new access token
app.get('/refresh_token', function(req, res) {

    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
});
  
//404 error 
app.use((req, res) => {
    res.status(404).render('404');
});

