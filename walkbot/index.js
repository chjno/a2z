var creds = require('./creds.js');
var gmap = require('@google/maps').createClient({
  key: creds.g
});
var webshot = require('webshot');
var twit = require('twit');
var T = new twit(creds.t);
var fs = require('fs');
var util = require('util');
var Clarifai = require('clarifai');
var clar = new Clarifai.App(creds.c.id, creds.c.secret);
var GoogleURL = require('google-url');
var gurl = new GoogleURL({key: creds.g});

var init = function(){
  console.log(' ');
  console.log(' ');
  console.log(' ');
  console.log(' ');
  console.log(' ');
  if (tweet.first){
    there.getRoute();
  } else {
    here.coords = there.coords;
    console.log(there.route.endAddress);
    var matches = there.route.endAddress.match(/,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/);
    if (matches.length > 0){
      here.location = matches[1] + ', ' + matches[2];
    }
    here.distance += there.route.distance.value;
    if (there.place.id){
      here.history.push(there.place.id);
    }

    tweet.updateProfile();

    fs.writeFile('./origin.js', 'module.exports = ' + util.inspect(here, {depth: null}),
      function(err){

      }
    );

    there.coords = [];
    there.route = {};
    // there.localTime = ;
    there.place = {};
    there.streetView = {};
    there.foundPhoto = false;

    setTimeout(there.newDest, tweet.timeout);
    console.log('will tweet again in ' + tweet.timeout + ' secs');
  }
};


var tweet = {
  first: true,
  timeout: 0,

  genText: function(){

  }, 

  tweeted: function(err, data, response){
    if (tweet.first){
      tweet.first = false;
    }

    if (!err){
      console.log('tweeted: ' + data.text);
      // here.update();
      init();
    }
  },

  updateProfile: function(){
    var miles = Math.floor(here.distance * 0.00062137);
    var bio = 'distance walked: ' + miles + ' miles';

    var location = here.location.length <= 30 ? here.location : here.location.substring(0,30);

    T.post('account/update_profile', {description: bio, location: location}, function(err, data, response){
      if (!err){
        console.log('bio updated');
      }
    });


      // https://api.twitter.com/1.1/account/update_profile.json?description=Keep%20calm%20and%20rock%20on
  },

  updateStatus: function(text, image){
    console.log('tweet: start');
    if (image){

      var b64content = fs.readFileSync(image, { encoding: 'base64' });
      T.post('media/upload', { media_data: b64content }, function (err, data, response) {
        // now we can assign alt text to the media, for use by screen readers and 
        // other text-based presentations and interpreters 
        var mediaIdStr = data.media_id_string;
        // var altText = "Small flowers in a planter on a sunny balcony, blossoming.";
        // var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };
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



var here = {
  coords: [39.967627, -98.042574],
  location: 'Superior, KS',
  distance: 0,
  history: [],

  // update: function(){
  //   here.coords = there.coords;
  //   var matches = there.route.endAddress.match(/,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/);
  //   here.location = matches[1] + ', ' + matches[2];
  //   here.distance += there.route.distance.value;
  //   here.history.push(there.place.id);

  //   tweet.updateProfile();

  //   fs.writeFile('./origin.js', 'module.exports = ' + util.inspect(here, {depth: null}),
  //     function(err){

  //     }
  //   );

  //   there.coords = [];
  //   there.route = {};
  //   // there.localTime = ;
  //   there.place = {};
  //   there.streetView = {};
  //   there.image = {};

  //   setTimeout(there.newDest, tweet.timeout);
  //   console.log('will tweet again in ' + tweet.timeout + ' secs');
  // }
};



var there = {
  coords: [39.967627, -98.042574],
  route: {
    // endAddress: 'Webber Rd, Superior, KS 68978, USA',
    // distance: {value: 0},
  },
  // localTime: ,
  place: {},
  streetView: {
    /*
      url: '',
      shortUrl: '',
      localPath: '',
      tags: {}
    */
  },
  foundPhoto: false,

  newDest: function(){
    console.log('init: starting again');
    var latMin = 24.544090;
    var latMax = 49.002389;
    var longMin = -124.733056;
    var longMax = -66.949778;

    var latMultiplier = Math.random() < 0.5 ? -0.06 : 0.06;
    var longMultiplier = Math.random() < 0.5 ? -0.06 : 0.06;

    var newLat = here.coords[0] + (Math.random() + (0.009 / 0.06)) * latMultiplier;
    var newLong = here.coords[1] + (Math.random() + (0.009 / 0.06)) * longMultiplier;

    while (newLat < latMin || newLat > latMax){
      var newLat = here.coords[0] + Math.random() * latMultiplier;
    }
    while (newLong < longMin || newLong > longMax){
      var newLong = here.coords[1] + Math.random() * longMultiplier;
    }

    there.coords = [newLat, newLong];
    console.log(there.coords);
    there.getRoute();
    // there.getStreetView();
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
            // text
            // value
          there.route.duration = data.legs[0].duration;
            // there.route.duration.text
            // there.route.duration.value * 10000
          there.route.endAddress = data.legs[0].end_address;
            // /,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/
          there.route.endCoords = data.legs[0].end_location;
          console.log('route: set');

          // console.log(there.route);
          // there.getStreetView();

          // if (tweet.first){
          //   tweet.timeout = 900000;
          // } else {
          //   tweet.timeout = there.route.duration.value * 10000;
          // }
          tweet.timeout = 60000/2;
          console.log('timeout ' + tweet.timeout);
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
          // tweet('hello world', './streetview.png');
          // tagImage(shortUrl);
          there.tagImage(there.streetView);
        }
      }
    );
  },

  // getPlacePhoto: function(ref){
  //   gmap.placesPhoto({photoreference: ref}, function(err, response){
  //     console.log('photo: response received');
  //     console.log(response);
  //   })
  // },

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

    // console.log(obj.url);

    gurl.shorten(obj.url, function(err, newUrl) {
      there.place.shortUrl = newUrl;
    });

    webshot(
      obj.url,
      'place.png',
      {
        shotSize: {
          width: cropWidth,
          height: cropHeight
        }
      },
      function(err){
        if (!err){
          there.place.localPath = './place.png';
          console.log('place photo: downloaded');
          there.tagImage(there.place)
          // tweet('hello world', './streetview.png');
          // tagImage(shortUrl);
          // there.tagImage(there.streetView);
        }
      }
    );
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
      radius: 5000
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
              // console.log(data[i].name + ' has a photo');
              if (here.history.indexOf(data[i].place_id) == -1){
                if (!data[i].photos[0].html_attributions[0].includes(data[i].name)){
                  there.coords[0] = data[i].geometry.location.lat;
                  there.coords[1] = data[i].geometry.location.lng;
                  there.place.name = data[i].name;
                  there.place.photos = data[i].photos;
                  there.place.id = data[i].place_id;
                  there.place.types = data[i].types;
                  there.place.vicinity = data[i].vicinity;
                  console.log(data[i].name + ' has a unique photo!');
                  there.foundPhoto = true;
                  break;
                }
              }
            }
          }

          // console.log(there.place);

          if (there.foundPhoto){
            // console.log('getting place photo');
            // there.getPlacePhoto(there.place);
            there.getRoute();
          } else {
            console.log('no places w/ photos nearby');


            // get new dest?
            there.newDest();

          }
          console.log(' ');
        } else {
          console.log('no places nearby');
          console.log(' ');

          // get new dest?
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
                there.getPlaces();
              } else {
                console.log('clarifai: no street image 2');
                there.getPlacePhoto(there.place);
              }
            } else {
              // console.log(obj.tags);
              tweet.updateStatus(obj.tags[0][0], obj.localPath);
            }
            console.log(' ');
          } else {
            obj.tags = [];
            for (var i = 0; i < data.length; i++){
              obj.tags[i] = [];
              obj.tags[i][0] = data[i].name;
              obj.tags[i][1] = data[i].value;
            }
            if (obj.tags.indexOf('illustration') == -1){
              tweet.updateStatus(obj.tags[0][0], obj.localPath);
            } else {
              console.log('clarifai: illustration');
              console.log(' ');
              here.history.push(there.place.id);
              there.getPlaces();
            }
          }  
        } else {


          // clarifai broken?
          // new dest?
          there.newDest();

        }
      },
      function(err) {
        console.log(err);
      }
    );
  }
};

// there.newDest();

init();




// var updateHere = function(location){
//   here.coords = location.coords;
//   /*
//     write to file
//       here.distance += there.route.distance.value;
//       here
//   */
//   fs.writeFile('./origin.js', 'module.exports = ' + util.inspect(here),
//     function(err){

//     }
//   );

//   there.coords = [];
//   there.route = {};
//   there.image = {};
// };



// var getRoute = function(start, end){
//   gmap.directions({
//     origin: start.coords,
//     destination: this.coords,
//     mode: 'walking',
//     alternatives: false
//   }, function(err, response){
//     if (!err){
//       var data = response.json.routes[0];

//       there.route.name = data.summary;
//       there.route.distance = data.legs[0].distance;
//         // text
//         // value
//       there.route.duration = data.legs[0].duration;
//         // there.route.duration.text
//         // there.route.duration.value * 10000
//       there.route.endAddress = data.legs[0].end_address;
//         // /,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/
//       there.route.endCoords = data.legs[0].end_location;

//       console.log(there.route);
//       // setTimeout(tweet, there.route.duration.value * 10000);
//     }
//   });
// };

// there.newDest(here);
// getRoute(here, there);


// var tagImage = function(url){
//   clar.models.predict(Clarifai.GENERAL_MODEL, url).then(
//     function(response) {
//       var data = response.data.outputs[0].data.concepts;

//       var badTagCount = 0;
//       var badTags = [
//         "illustration",
//         "vector",
//         "pattern",
//         "wallpaper",
//         "art",
//         "abstract",
//         "square",
//         "horizontal",
//         "no person",
//         "vertical",
//         "simplicity",
//         "design",
//         "decoration",
//         "ornate",
//         "background",
//         "people",
//         "old",
//         "shape",
//         "graphic",
//         "empty"
//       ];

//       var tags = [];
//       for (var i = 0; i < data.length; i++){
//         if (badTags.indexOf(data.name) != -1){
//           badTagCount++;
//         }
//         tags[i][0] = data.name;
//         tags[i][1] = data.value;
//       }

//       if (badTagCount > 9){
//         console.log('no street image');
//       } else {
//         console.log(tags);
//         there.image.tags = tags;
//       }
//     },
//     function(err) {
//       console.log(err);
//     }
//   );
// }

// var getStreetView = function(dest){
//   // var url = 'https://maps.googleapis.com/maps/api/streetview?' +
//   //   'size=600x400' +
//   //   '&location=' + dest.coords.join(',') +
//   //   '&fov=120' +
//   //   '&key=' + creds.g;




//   var shortUrl = '';
//   gurl.shorten(dest.image.url, function(err, newUrl) {
//     shortUrl = newUrl;
//   });

//   webshot(
//     // // test
//     // 'https://maps.googleapis.com/maps/api/streetview?size=600x400' +
//     // '&location=39.92825776163083,-98.02838466827663&fov=120' +
//     // '&key=AIzaSyBbw1DChj5bYB4zDSBhdfmGtZZLL8q3VEg',
//     dest.image.url,
//     'streetview.png',
//     {
//       shotSize: {
//         width: 600,
//         height: 378
//       }
//     },
//     function(err){
//       if (!err){
//         // tweet('hello world', './streetview.png');
//         tagImage(shortUrl);
//       }
//     }
//   );

//   // console.log(url);
// };



// getStreetView(there);


// var getPlaces = function(location){
//   gmap.placesNearby({
//     location: location.coords,
//     radius: 5000
//   }, function(err, response){
//     if (!err){
//       var data = response.json.results;

//       for (var i = 0; i < data.length; i++){
//         console.log(data[i].name);
//         // console.log('open now: ' + data[i].opening_hours.open_now);
//         // console.log('photos: ' + data[i].photos.length);
//         // console.log('place ID: ' + data[i].place_id);
//         // console.log(data[i].types);
//       }
//     }
//   });
// };

// getPlaces(there);



// getLocalTime = function(location){
//   var date = new Date();
//   var timestamp = date.getTime();
//   var timestampSecs = Math.floor(timestamp / 1000);


//   gmap.timezone({
//     location: location.coords,
//     timestamp: timestampSecs
//   }, function(err, response){
//     if (!err){
//       callback(timeresponse);

//       var date = new Date(timestamp);
//       var hours = date.getHours();
//       var minutes = "0" + date.getMinutes();
//       var formattedTime = hours + ':' + minutes.substr(-2);
//     }
//   });
// };


// var tweeted = function(err, data, response){
//   if (err){
//     console.log(err);
//   } else {
//     console.log(data.text);

//     // updateHere();
//   }
// };

// var tweet = function(text, image){
//   if (image){

//     var b64content = fs.readFileSync(image, { encoding: 'base64' });
//     T.post('media/upload', { media_data: b64content }, function (err, data, response) {
//       // now we can assign alt text to the media, for use by screen readers and 
//       // other text-based presentations and interpreters 
//       var mediaIdStr = data.media_id_string;
//       // var altText = "Small flowers in a planter on a sunny balcony, blossoming.";
//       // var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };
//       var meta_params = { media_id: mediaIdStr};
     
//       T.post('media/metadata/create', meta_params, function (err, data, response) {
//         if (!err) {
//           var params = { status: text, media_ids: [mediaIdStr] };
     
//           T.post('statuses/update', params, tweeted);
//         }
//       });
//     });

//   } else {

//     T.post('statuses/update', {status: text}, tweeted);
//   }

// };

/*
  tweet contents
    distance walked
    location



*/




