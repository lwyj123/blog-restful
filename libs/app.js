var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');

var config = require(libs + 'config');
var log = require('./log')(module);
var oauth2 = require('./auth/oauth2');

var api = require('./routes/api');
var users = require('./routes/users');
var articles = require('./routes/articles');
var oauth = require('./routes/oauth');
var auth = require('./routes/auth');

var jwt = require('jsonwebtoken');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Token");
  next();
});

app.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['access-token'];
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.get('jwt:secret'), function(err, decoded) {     
      if (err) {
        req.decoded = null;   
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;  
      }  
    });
  }
  next();
}); 

app.use('/', api);
app.use('/api', api);
app.use('/api/users', users);
app.use('/api/articles', articles);
app.use('/api/auth', auth);
app.use('/api/oauth', oauth);

app.use('/api/oauth/token', oauth2.token);


// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ 
    	error: err.message 
    });
    return;
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});

module.exports = app;