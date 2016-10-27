var post = true;
var shortTimeout = true;
var shortTimeoutLength = 1000 * 60;

var creds = require('./creds.js');
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
    console.log('adjust x ' + loopCount / 2);
    console.log(' ');
  }
};


var init = function(){
  here.history.coords.push(here.coords);
  here.coords = there.coords;
  // console.log(there.route.endAddress);
  var matches = there.route.endAddress.match(/,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/);
  try {
    here.location = matches[1] + ', ' + matches[2];
  } catch (e) {
    console.log('');
    console.log(e);
    console.log('');
    console.log(matches);
    console.log('');
  }
  here.distance += there.route.distance.value;
  if (there.place.id){
    here.history.places.push(there.place.id);
  }

  tweet.updateProfile();


  fs.writeFile('./here.js', 'module.exports = ' + util.inspect(here, {depth: null}),
    function(err){

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

  if (shortTimeout){
    setTimeout(there.newDest, shortTimeoutLength);
    console.log('will tweet again in ' + shortTimeoutLength.toString());
  } else {
    setTimeout(there.newDest, tweet.timeout);
    var timeoutReadable = [];
    timeoutReadable[0] = Math.floor(((tweet.timeout / (1000*60*60)) % 24));
    timeoutReadable[1] = Math.floor(((tweet.timeout / (1000*60)) % 60));
    timeoutReadable[2] = Math.floor((tweet.timeout / 1000) % 60);

    console.log('will tweet again in ' + timeoutReadable.join(':'));
  }

  console.log(' ');
  console.log(' ');
  console.log(' ');
};

var getMap = function(){
  console.log('trip map: start');

  var url = 'https://maps.googleapis.com/maps/api/staticmap?' +
    'size=640x200&' +
    'scale=2&' +
    'markers=' + here.history.coords.join('|') +
    '&path=' + here.history.coords.join('|') +
    '&key=' + creds.g;
  // gurl.shorten(url, function(err, newUrl) {
  //   url = newUrl;
  // });

    download(url, 'header.png', function(){
      localPath = './header.png';
      console.log('trip map: downloaded');
      console.log(' ');
      tweet.updateHeader(localPath);
    });

  // webshot(
  //   url,
  //   'header.png',
  //   {
  //     shotSize: {
  //       width: 640,
  //       height: 458
  //     }
  //   },
  //   function(err){
  //     if (!err){
  //       console.log('trip map: downloaded');
  //       console.log(' ');
  //       tweet.updateHeader('./header.png');
  //     }
  //   }
  // );
};


var tweet = {
  first: true,
  timeout: 0,

  genText: function(){

  },

  tweeted: function(err, data, response){
    if (!err){
      console.log('tweeted: ' + data.text);
      // here.update();
      getMap();
      init();
    }
  },

  updateProfile: function(){
    var miles = Math.floor(here.distance * 0.00062137);
    var bio = 'distance walked: ' + miles + ' miles';

    var location = here.location.length <= 30 ? here.location : here.location.substring(0,30);

    T.post('account/update_profile', {description: bio, location: location}, function (err, data, response){
      if (!err){
        console.log('bio updated');
      }
    });
  },

  updateHeader: function(image){
    var b64content = fs.readFileSync(image, { encoding: 'base64' });
    T.post('account/update_profile_banner', {banner: b64content}, function (err, data, response){
      if (!err){
        jsonfile.writeFile('headerresponse.json', response, {spaces: 2}, function (err){
          if (!err){
            console.log('header response written to file');
          }
        });
        console.log('header updated');
      }
    });
  },

  updateStatus: function(text, image){
    console.log('tweet: start');
    if (image){

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

      var params = {
        status: text,
        lat: there.coords[0],
        long: there.coords[1],
        display_coordinates: true
      };

      T.post('statuses/update', params, tweet.tweeted);
    }

  }
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


var here = require('./here.js');


var there = {
  coords: [],
  route: {},
  // localTime: ,
  place: {},
  streetView: {},
  foundPhoto: false,

  newDest: function(){
    console.log('newDest: start');
    var latMin = 24.544090;
    var latMax = 49.002389;
    var longMin = -124.733056;
    var longMax = -66.949778;

    var multiplier = 0.06 + multiplierAdjust;

    var latMultiplier = Math.random() < 0.5 ? -multiplier : multiplier;
    var longMultiplier = Math.random() < 0.5 ? -multiplier : multiplier;

    var newLat = here.coords[0] + (Math.random() + (0.009 / 0.06)) * latMultiplier;
    var newLong = here.coords[1] + (Math.random() + (0.009 / 0.06)) * longMultiplier;

    while (newLat < latMin || newLat > latMax){
      newLat = here.coords[0] + Math.random() * latMultiplier;
    }
    while (newLong < longMin || newLong > longMax){
      newLong = here.coords[1] + Math.random() * longMultiplier;
    }

    there.coords = [newLat, newLong];
    console.log(there.coords);
    there.getRoute();
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

          // bookmark

          // if (here.distance == 0){
          //   tweet.timeout = 900000;
          // } else {
            tweet.timeout = there.route.duration.value * 1000;
          // }
          // tweet.timeout = 60000/2;
          // console.log('timeout ' + tweet.timeout);
          console.log(' ');


          there.getStreetView();
          // there.getPlaces();


        } else {
          console.log('no route to destination');
          there.newDest();
        }
      } else {
        console.log(err);
      }
    });
  },

  getStreetView: function(){
    console.log('streetview: start');
    there.streetView.url = 'https://maps.googleapis.com/maps/api/streetview?' +
      'size=600x400' +
      '&location=' + there.coords.join(',') +
      '&fov=120' +
      '&key=' + creds.g;
    gurl.shorten(there.streetView.url, function(err, newUrl) {
      there.streetView.shortUrl = newUrl;
    });

    // download(there.streetView.url, 'streetview.jpg', function(){
    //   there.streetView.localPath = './streetview.jpg';
    //   console.log('streetview: downloaded');
    //   console.log(' ');
    //   there.tagImage(there.streetView);
    // });

    webshot(
      there.streetView.url,
      'streetview.png',
      {
        shotSize: {
          width: 600,
          height: 378
        }
      },
      function(err){
        if (!err){
          there.streetView.localPath = './streetview.png';
          console.log('streetview: downloaded');
          console.log(' ');
          there.tagImage(there.streetView);
        }
      }
    );
  },

  getPlacePhoto: function(obj){
    console.log('place photo: start');
    // console.log(obj);

    var cropWidth = 600;
    var cropHeight;
    if (obj.photos[0].width < 600){
      cropWidth = obj.photos[0].width;
      cropHeight = obj.photos[0].height;
    } else {
      cropHeight = 600 * obj.photos[0].height / obj.photos[0].width;
    }

    obj.url = 'https://maps.googleapis.com/maps/api/place/photo?' +
      'maxwidth=600' +
      '&photoreference=' + obj.photos[0].photo_reference +
      '&key=' + creds.g;

    gurl.shorten(obj.url, function(err, newUrl) {
      there.place.shortUrl = newUrl;
    });

    download(obj.url, 'place.jpg', function(){
      there.place.localPath = './place.jpg';
      console.log('place photo: downloaded');
      there.tagImage(there.place);
    });

    // webshot(
    //   obj.url,
    //   'place.png',
    //   {
    //     shotSize: {
    //       width: cropWidth,
    //       height: cropHeight
    //     }
    //   },
    //   function(err){
    //     if (!err){
    //       there.place.localPath = './place.png';
    //       console.log('place photo: downloaded');
    //       there.tagImage(there.place);
    //     }
    //   }
    // );
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

  getPlaces: function(){
    console.log('places: start');
    gmap.placesNearby({
      location: there.coords,
      radius: 5000 + radiusAdjust
    }, function(err, response){
      if (!err){
        var data = response.json.results;

        if (data.length > 0){
          // there.getDetails(data[0].place_id);

          // for (var i = 0; i < data.length; i++){
          //   // there.getDetails(data[i].place_id);
          //   there.places[i] = data[i];
          // }

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
                  console.log('places: found unique photo');
                  console.log(' ');
                  there.foundPhoto = true;
                  break;
                }
              }
            }
          }

          if (there.foundPhoto){
            there.getRoute();
          } else {
            console.log('no places w/ photos nearby');

            // start over
            loopChecker();
            there.newDest();

          }
        } else {
          console.log('no places nearby');
          console.log(' ');

          // start over
          loopChecker();
          there.newDest();

        }
      }
    });
  },

  tagImage: function(obj){
    console.log('clarifai: start');
    clar.models.predict(Clarifai.GENERAL_MODEL, obj.shortUrl).then(
      function(response) {
        var data = response.data.outputs[0].data.concepts;
        if (data.length > 0){

          var postText;
          if (obj == there.streetView){
            var badTagCount = 0;
            var badTags = [
              "illustration",
              "vector",
              "pattern",
              "wallpaper",
              "art",
              "abstract",
              "square",
              "horizontal",
              "no person",
              "vertical",
              "simplicity",
              "design",
              "decoration",
              "ornate",
              "background",
              "people",
              "old",
              "shape",
              "graphic",
              "empty"
            ];

            obj.tags = [];
            for (var i = 0; i < data.length; i++){
              if (badTags.indexOf(data[i].name) != -1){
                badTagCount++;
              }
              obj.tags[i] = [];
              obj.tags[i][0] = data[i].name;
              obj.tags[i][1] = data[i].value;
            }

            if (badTagCount > 9){
              if (!there.foundPhoto){
                console.log('clarifai: no street image 1');
                console.log(' ');
                there.getPlaces();
              } else {
                console.log('clarifai: no street image 2');
                console.log(' ');
                there.getPlacePhoto(there.place);
              }
            } else {
              postText = obj.tags[0][0];

              if (obj.tags[0][0] == 'horizontal plane'){
                postText = obj.tags[0][1];
              }

              if (post){
                tweet.updateStatus(postText, obj.localPath);
              } else {
                console.log('');
                console.log('tweet');
                console.log(there.coords);
                console.log(postText);
                console.log(obj.localPath);
              }
            }
          } else {
            obj.tags = [];
            for (var j = 0; j < data.length; j++){
              obj.tags[j] = [];
              obj.tags[j][0] = data[j].name;
              obj.tags[j][1] = data[j].value;
            }
            if (obj.tags.indexOf('illustration') == -1){
              postText = obj.tags[0][0];

              if (obj.tags[0][0] == 'horizontal plane'){
                postText = obj.tags[0][1];
              }

              if (post){
                tweet.updateStatus(postText, obj.localPath);
              } else {
                console.log('');
                console.log('tweet');
                console.log(there.coords);
                console.log(postText);
                console.log(obj.localPath);
              }
            } else {
              console.log('clarifai: illustration');
              console.log(' ');
              here.history.places.push(there.place.id);
              there.getPlaces();
            }
          }
          console.log(' ');
        } else {


          // clarifai broken?
          // start over
          loopChecker();
          there.newDest();

        }
      },
      function(err) {
        console.log(err);
      }
    );
  }
};


there.newDest();
