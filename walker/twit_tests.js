var fs = require('fs');
var creds = require('./creds.js');
var twit = require('twit');
var T = new twit(creds.t);
var jsonfile = require('jsonfile');

var me = me;

var uploadBanner = function(image){
  var b64content = fs.readFileSync(image, { encoding: 'base64' });
  var params = {
    banner: b64content,
    // width: 1280,
    // height: 400
  };
  T.post('account/update_profile_banner', params, function (err, data, response){
    if (!err){
      jsonfile.writeFile('headerresponse.json', response, {spaces: 2}, function (err){});
      console.log('uploaded header');
    } else {
      console.log('header error');
      jsonfile.writeFile('headererr.json', response, {spaces: 2}, function (err){});

    }
  });

};

var getBanner = function(user){

  T.get('users/profile_banner', {screen_name: user}, function (err, data, response){
    if (!err){
      console.log(data);
    }
  });

};

var removeBanner = function(user){
  T.post('account/remove_profile_banner', function (err, data, response){
    if (!err){
      console.log('removed banner');
    }
  });
};

var getUser = function(user){

  T.get('users/show', {screen_name: user}, function (err, data, response){
    if (!err){
      console.log('got user info');
    }
  });

};

var getTweets = function(user){

  T.get('statuses/user_timeline', {screen_name: user}, function (err, data, response){
    if (!err){
      for (var i = 0; i < data.length; i++){
        console.log(data[i].id_str);
      }
    }
  });

};

var destroyTweets = function(tweetID){
  T.post('statuses/destroy/' + tweetID, function (err, data, response){
    if (!err){
      console.log('tweet destroyed');
    }
  });
};

var updateStatus = function(text, image){
  if (image){

    var b64content = fs.readFileSync(image, { encoding: 'base64' });
    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      var mediaIdStr = data.media_id_string;
      var meta_params = { media_id: mediaIdStr};

      T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (!err) {
          var params = {
            status: text,
            media_ids: [mediaIdStr]
          };

          T.post('statuses/update', params, function (err, data, response){
            if (!err){
              console.log('tweeted');
            }
          });
        }
      });
    });

  } else {

    var params = {
      status: text,
      lat: there.coords[0],
      long: there.coords[1],
      display_coordinates: true
    };

    T.post('statuses/update', params, tweet.tweeted);
  }

};

var updateProfileImage = function(image){
  // var b64content = fs.readFileSync(image, { encoding: 'base64' });
  var b64content = fs.readFileSync(image, { encoding: 'base64' });
  var params = {
    image: b64content,
    // width: 1280,
    // height: 400
  };
  T.post('account/update_profile_image', params, function (err, data, response){
    if (!err){
      console.log('uploaded profile image');
    }
  });

};


uploadBanner('./header.png');
// uploadBanner('./header-small.png');
// getBanner(me);
// getUser(me);
// removeBanner(me);
// getTweets(me);
// updateStatus('hi', './header-small.png');
// updateProfileImage('./header.png');