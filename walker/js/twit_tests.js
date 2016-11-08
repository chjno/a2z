var fs = require('fs');
var creds = require('./js/creds.js');
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

  T.get('statuses/user_timeline', {screen_name: user, count: 200}, function (err, data, response){
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
      console.log('tweet ' + tweetID + ' destroyed');
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


// uploadBanner('./header.png');
// uploadBanner('./header-small.png');
// getBanner(me);
// getUser(me);
// removeBanner(me);
// getTweets(me);
// updateStatus('hi', './header-small.png');
// updateProfileImage('./header.png');

// var tweets = [
// '793487602473140225',
// '791882570434764800',
// '791882266280660992',
// '791876347794776064',
// '791872622187470848',
// '791869786615607296',
// '791733670000390144',
// '791678441024258048',
// '791678045916655616',
// '791676628904665089',
// '791675576746729472',
// '791672448882208768',
// '791671378990759936',
// '791671080855429120',
// '791670746879778816',
// '791670075426234372',
// '791667488203341824',
// '790809284821082112',
// '790805617610985472',
// '790805284528742400',
// '790804012593516544',
// '790802872409657345',
// '790801625275310080',
// '790800794727612416',
// '790800037517418497',
// '790798969538486272',
// '790777742606434304',
// '790777429010907136',
// '790777133475954688',
// '785757365106774016',
// '785756426765557760',
// '785754931278012416',
// '785749949678059520',
// '785748565725483008',
// '785742852001234944',
// '785736388692078592',
// '785733657017323520',
// '785732195080101888',
// '785730619850489856',
// '785730433770192896',
// '785730147152453632',
// '785729976985391104',
// '785723042366361600',
// '785721210344710144',
// '785721016718856192',
// '785720655480295424',
// '785720472998649856',
// '785720312126140416',
// '785720124112273408',
// '785719929492344832',
// '785716295807430656'
// ];

// for (var i = 0; i < tweets.length; i++){
//   destroyTweets(tweets[i]);
// }

// getTweets(me);