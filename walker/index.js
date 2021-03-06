var post = true;
var shortTimeout = true;
var shortTimeoutLength = 5000;

var creds = require('./js/creds.js');
var gmap = require('@google/maps').createClient({
  key: creds.g
});
var webshot = require('webshot');
var twit = require('twit');
var T = new twit(creds.t);
var fs = require('fs');
var request = require('request');
var util = require('util');
var Clarifai = require('clarifai');
var clar = new Clarifai.App(creds.c.id, creds.c.secret);
var GoogleURL = require('google-url');
var gurl = new GoogleURL({key: creds.g});
var jsonfile = require('jsonfile');

// var wik = require('./js/wiki.js');
// var wiki = new wik.Wiki(request);

var loopCount = 0;
var multiplierAdjust = 0;
var radiusAdjust = 0;


var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


var loopChecker = function(){
  loopCount++;
  if (loopCount > 25){
    process.exit();
  }
  if (loopCount % 2 === 0){
    multiplierAdjust += 0.01;
    radiusAdjust += 1000;
    console.log('adjust x' + loopCount / 2);
    console.log(' ');
  }
};


var init = function(){
  here.history.coords.push(here.coords);
  here.coords = there.coords;
  var matches = there.route.endAddress.match(/,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/);
  try {
    here.location = matches[1] + ', ' + matches[2];
  } catch (e) {
    console.log('regex error');
    console.log(there.route.endAddress);
    console.log('');
    console.log(e);
    console.log('');
  }
  here.distance += there.route.distance.value;
  if (there.place.id){
    here.history.places.push(there.place.id);
  }

  tweet.updateProfile();


  // fs.writeFile('./js/here.js', 'module.exports = ' + util.inspect(here, {depth: null}),
  var json = JSON.stringify(here, null, 2);
  fs.writeFile('./js/here.js', 'module.exports = ' + json, function (err){
      if (!err){
        console.log('here.js written');
      } else {
        console.log('here.js write error');
      }
    }
  );

  there.coords = [];
  there.route = {};
  // there.localTime = ;
  there.place = {};
  there.streetView = {};
  there.foundPhoto = false;

  multiplierAdjust = 0;
  radiusAdjust = 0;

  console.log(' ');
  console.log(' ');
  console.log(' ');
  console.log('reinitializing');
  there.newDest();
};

var tweet = {
  text: '',

  tweeted: function(err, data, response){
    if (!err){
      console.log('tweeted: ' + data.text);
      init();
    } else {
      console.log('tweet error');
    }
  },

  getMap: function(){
    console.log('trip map: start');

    var youwerehere = here.history.coords.slice(0, here.history.coords.length-1);
    var youarehere = here.history.coords[here.history.coords.length-1];

    var url = 'https://maps.googleapis.com/maps/api/staticmap?' +
      'size=640x640&' +
      'scale=2&' +
      'markers=' + youwerehere.join('|') +
      '&markers=color:green|' + youarehere.join() +
      '&path=' + here.history.coords.join('|') +
      '&key=' + creds.g;

    download(url, './pics/tripmap.png', function(){
      console.log('trip map: downloaded');
      console.log(' ');
      tweet.updateAvatar('./pics/tripmap.png');
    });

  },

  updateProfile: function(){
    var miles = Math.floor(here.distance * 0.00062137);
    var bio = 'distance walked: ' + miles + ' miles';

    var location = here.location.length <= 30 ? here.location : here.location.substring(0,30);

    T.post('account/update_profile', {description: bio, location: location}, function (err, data, response){
      if (!err){
        console.log('bio updated');
      } else {
        console.log('bio update error');
      }

      tweet.getMap();

    });
  },

  // updateHeader: function(image){
  //   var b64content = fs.readFileSync(image, { encoding: 'base64' });
  //   var params = {
  //     banner: b64content,
  //     width: 1280,
  //     height: 400
  //   };
  //   T.post('account/update_profile_banner', params, function (err, data, response){
  //     if (!err){
  //       console.log('header response written to file');
  //       console.log('header updated');
  //     } else {

  //     }
  //   });
  // },

  updateAvatar: function(image){
    console.log('updating avatar');
    var b64content = fs.readFileSync(image, { encoding: 'base64' });
    var params = {
      image: b64content
    };
    T.post('account/update_profile_image', params, function (err, data, response){
      console.log('avatar response');
      if (!err){
        console.log('avatar updated');
      } else {
        console.log('avatar error');
      }

    });
  },

  schedule: function(text, image, delay){
    
    var updateStatus = function(){
      console.log('tweet: start');
      if (image){
        console.log(image);
        var b64content = fs.readFileSync(image, { encoding: 'base64' });
        T.post('media/upload', { media_data: b64content }, function (err, data, response) {
          var mediaIdStr = data.media_id_string;
          var meta_params = { media_id: mediaIdStr};

          T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
              var params = {
                status: text,
                lat: there.coords[0],
                long: there.coords[1],
                display_coordinates: true,
                media_ids: [mediaIdStr]
              };

              T.post('statuses/update', params, tweet.tweeted);
            }
          });
        });

      } else {
        console.log('false');

        var params = {
          status: text,
          lat: there.coords[0],
          long: there.coords[1],
          display_coordinates: true
        };

        T.post('statuses/update', params, tweet.tweeted);
      }

    };

    console.log('completed in ' + loopCount + ' loops');
    loopCount = 0;

    setTimeout(updateStatus, delay);

    var timeoutReadable = [];
    timeoutReadable[0] = Math.floor(((delay / (1000*60*60)) % 24));
    timeoutReadable[1] = Math.floor(((delay / (1000*60)) % 60));
    timeoutReadable[2] = Math.floor((delay / 1000) % 60);

    console.log('will tweet in ' + timeoutReadable.join(':'));

  },
};

// var here = {
//   coords: [39.967627, -98.042574],
//   location: 'Superior, KS',
//   distance: 0,
//   history: {
//     places: [],
//     coords: []
//   },
// };


var here = require('./js/here.js');


var there = {
  coords: [],
  route: {},
  // localTime: ,
  place: {},
  streetView: {},
  foundPhoto: false,

  newDest: function(){
    console.log('newDest: start');

    var multiplier = 0.06 + multiplierAdjust;

    var latMultiplier = Math.random() < 0.5 ? -multiplier : multiplier;
    var longMultiplier = Math.random() < 0.5 ? -multiplier : multiplier;

    var newLat = here.coords[0] + (Math.random() + (0.009 / 0.06)) * latMultiplier;
    var newLong = here.coords[1] + (Math.random() + (0.009 / 0.06)) * longMultiplier;

    there.coords = [newLat, newLong];
    console.log(there.coords);
    there.getRoute();
    // there.getPlaces();
  },

  getRoute: function(){
    console.log('route: start');
    gmap.directions({
      origin: here.coords,
      destination: there.coords,
      mode: 'walking',
      alternatives: false
    }, function(err, response){
      if (!err){
        if (response.json.routes.length > 0){
          var data = response.json.routes[0];

          there.route.name = data.summary;
          there.route.distance = data.legs[0].distance;
          there.route.duration = data.legs[0].duration;
          there.route.endAddress = data.legs[0].end_address;
          there.route.endCoords = data.legs[0].end_location;
          console.log('route: set');
          console.log(' ');

          if (there.foundPhoto){

            console.log('status: ' + tweet.text);
            console.log('there: ' + there.coords);
            console.log('');

            var timeout = there.route.duration.value * 1000;

            if (shortTimeout){
              tweet.schedule(tweet.text, there.place.localPath, shortTimeoutLength);
            } else {
              tweet.schedule(tweet.text, there.place.localPath, timeout);
            }
          } else {
            there.getPlaces();
          }

        } else {
          console.log('no route to destination');
          there.newDest();
        }
      } else {
        console.log(err);
      }
    });
  },

  getPlaces: function(){
    console.log('places: start');
    gmap.placesNearby({
      location: there.coords,
      radius: 5000 + radiusAdjust
    }, function(err, response){
      if (!err){
        var data = response.json.results;

        if (data.length > 0){

          for (var i = 0; i < data.length; i++){
            if ('photos' in data[i]){
              if (here.history.places.indexOf(data[i].place_id) == -1){
                if (!data[i].photos[0].html_attributions[0].includes(data[i].name)){
                  there.coords[0] = data[i].geometry.location.lat;
                  there.coords[1] = data[i].geometry.location.lng;
                  there.place.name = data[i].name;
                  there.place.photos = data[i].photos;
                  there.place.id = data[i].place_id;
                  there.place.types = data[i].types;
                  there.place.vicinity = data[i].vicinity;
                  console.log(' ');
                  there.foundPhoto = true;
                  break;
                }
              }
            }
          }

          if (there.foundPhoto){
            // console.log('found photo getting route');
            // there.getRoute();
            console.log('places: found photo');
            console.log('');
            there.getPlacePhoto(there.place);
          } else {
            console.log('no places w/ photos nearby');

            // start over
            there.foundPhoto = false;
            loopChecker();
            there.newDest();

          }
        } else {
          console.log('no places nearby');
          console.log(' ');

          // start over
          there.foundPhoto = false;
          loopChecker();
          there.newDest();

        }
      } else {
        console.log(err);
        console.log('places error');
      }
    });
  },

  getPlacePhoto: function(obj){
    console.log('place photo: start');
    // console.log(obj);

    obj.url = 'https://maps.googleapis.com/maps/api/place/photo?' +
      'maxwidth=600' +
      '&photoreference=' + obj.photos[0].photo_reference +
      '&key=' + creds.g;

    gurl.shorten(obj.url, function(err, newUrl) {
      if (!err){
        there.place.shortUrl = newUrl;

        download(obj.url, './pics/place.jpg', function(){
          there.place.localPath = './pics/place.jpg';
          console.log('place photo: downloaded');
          there.tagImage(there.place);
        });
      } else {
        console.log('google url error');
        loopChecker();
        there.getPlaces();
      }
    });
  },

  // getDetails: function(placeId, array){
  //   gmap.place({placeid: placeId}, function(err, response){
  //     if (!err){
  //       // console.log('details: got details on ' + placeId);

  //       var data = response.json.result;
  //       if ('photos' in data){
  //         if (!data.photos[0].html_attributions[0].includes(data.name)){
  //           console.log(data.name + ' has photos');
  //           there.getPlacePhoto(data.photos[0].photo_reference);

  //           // there.getPlacePhoto(data.photos[0].photo_reference);
  //           // for (var i = 0; i < data.photos.length; i++){
  //           //   // console.log(data.photos[i].photo_reference);
  //           //   there.getPlacePhoto(data.photos[i].photo_reference);

  //           // }

  //         }
  //       }
  //     }
  //   })
  // },

  tagImage: function(obj){
    console.log('clarifai: start');
    clar.models.predict(Clarifai.GENERAL_MODEL, obj.shortUrl).then(
      function(response) {
        var data = response.data.outputs[0].data.concepts;
        if (data.length > 0){

          obj.tags = [];
          var badTags = [
            'horizontal',
            'horizontal plane'
          ];

          for (var k = 0; k < data.length; k++){
            if (badTags.indexOf(data[k].name) == -1){
              console.log(data[k].name);
              obj.tags.push(data[k].name);
            }
          }

          // if not an illustration
          if (obj.tags.indexOf('illustration') == -1){

            tweet.text = obj.tags[Math.floor(Math.random() * obj.tags.length)];

            if (post){

              there.getRoute();
            } else {

              // for testing: if (post == false)
              console.log('');
              console.log('tweet');
              console.log(there.coords);
              console.log(tweet.text);
              console.log(obj.localPath);
            }

          // else if illustration
          } else {

            // if illustration in place's tags
            console.log('clarifai: illustration');
            here.history.places.push(there.place.id);

            loopChecker();
            there.getPlaces();
          }
          console.log(' ');
        } else {

          console.log('clarifai no tags returned');
          console.log(' ');
          here.history.places.push(there.place.id);

          loopChecker();
          there.getPlaces();

        }
      },
      function(err) {
        console.log('clarifai error');
        loopChecker();
        there.getPlaces();
      }
    );
  }
};


there.newDest();
