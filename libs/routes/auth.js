var express = require('express');
var passport = require('passport');
var axios = require('axios');
var router = express.Router();

var querystring = require('querystring');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');

var db = require(libs + 'db/mongoose');
var User = require(libs + 'model/user');

router.get('/github',function(req, res) {
  let code = req.query.code;
  log.info(code);
  axios.get("https://github.com/login/oauth/access_token", {
      params: {
        code: code,
        client_id: config.get('githubOAuth:clientID'),
        client_secret: config.get('githubOAuth:clientSecret'),
      }
    })
    .then(function(response) {
      let obj = querystring.parse(response.data);
      log.info(obj.access_token)
      if(obj.error) {
        throw new Error('Get github access token fail.');
      }
      let access_token = obj.access_token;
      return axios.get('https://api.github.com/user?access_token=' + access_token)
    }).then(function(response) {
      let githubObj = response.data;
      log.info('githubObj Id: ', githubObj.id);
      // 
      User.find({ githubId: githubObj.id }, function (err, user) {
        if(!user) {
          let user = new User({
            githubId: githubObj.id,
            nickname: githubObj.name + '_github',
            avatar_url: githubObj.avatar_url,
          });
          user.save(function (err) {
            log.info(user)
            if (!err) {
              log.info("New user created with id: %s", user.userId);
              return res.json({ 
                status: 'OK', 
                user: user 
              });
            } else {
              if(err.name === 'ValidationError') {
                res.statusCode = 400;
                res.json({ 
                  error: 'Validation error' 
                });
              } else {
                res.statusCode = 500;
                
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                
                res.json({ 
                  error: 'Server error' 
                });
              }
            }
          })
        } else {
          log.info(user)
          if (!err) {
            return res.json({ 
              status: 'OK', 
              user: user,
            });
          } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            
            return res.json({ 
              error: 'Server error' 
            });
          }
        }
      });
    })
    .catch(function(error) {
      log.error(error)
      res.statusCode = 500; 
      return res.json({ 
        error: 'Get github access token fail.' 
      });
    })
});

module.exports = router;