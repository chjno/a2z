var creds = require('./creds.js');
var gmap = require('@google/maps').createClient({
  key: creds.g
});
var webshot = require('webshot');
var twit = require('twit');
var T = new twit(creds.t);
var fs = require('fs');



var here = {
  coords: [],
};

var there = {
  coords: [39.967627, -98.042574],
  route: {},
  // localTime: ,

  newCoords: function(location){
    var latMin = 24.544090;
    var latMax = 49.002389;
    var longMin = -124.733056;
    var longMax = -66.949778;

    var latMultiplier = Math.random() < 0.5 ? -0.06 : 0.06;
    var longMultiplier = Math.random() < 0.5 ? -0.06 : 0.06;

    var newLat = location.coords[0] + (Math.random() + (0.009 / 0.06)) * latMultiplier;
    var newLong = location.coords[1] + (Math.random() + (0.009 / 0.06)) * longMultiplier;

    while (newLat < latMin || newLat > latMax){
      var newLat = location.coords[0] + Math.random() * latMultiplier;
    }
    while (newLong < longMin || newLong > longMax){
      var newLong = location.coords[1] + Math.random() * longMultiplier;
    }

    this.coords = [newLat, newLong];
    console.log(this.coords);
  }
};



var getRoute = function(start, end){
  gmap.directions({
    origin: start.coords,
    destination: end.coords,
    mode: 'walking',
    alternatives: false
  }, function(err, response){
    if (!err){
      var data = response.json.routes[0];

      there.route.name = data.summary;
      there.route.distance = data.legs[0].distance.text;
      there.route.duration = data.legs[0].duration;
        // there.route.duration.text
        // there.route.duration.value * 10000
      there.route.endAddress = data.legs[0].end_address;
        // /,\s{1}(.*),\s{1}([A-Z]{2})\s{1}/
      there.route.endCoords = data.legs[0].end_location;

      console.log(there.route);
      setTimeout(tweet, there.route.duration.value * 10000);
    }
  });
};

// there.newCoords(here);
// getRoute(here, there);



var getStreetView = function(location){
  var url = 'https://maps.googleapis.com/maps/api/streetview?' +
    'size=600x400' +
    '&location=' + location.coords.join(',') +
    '&fov=120' +
    '&key=' + creds.g;

    webshot('https://maps.googleapis.com/maps/api/streetview?size=600x400' +
      '&location=39.92825776163083,-98.02838466827663&fov=120' +
      '&key=AIzaSyBbw1DChj5bYB4zDSBhdfmGtZZLL8q3VEg',
      'pic.png',
      {
        shotSize: {
          width: 600,
          height: 378
        }
      },
      function(err){
        if (!err){
          // tweet('hello world', './pic.png');
        }
      }
    );

  console.log(url);
};



getStreetView(there);


var getNearby = function(location){
  gmap.placesNearby({
    location: location.coords,
    radius: 5000
  }, function(err, response){
    if (!err){
      var data = response.json.results;

      for (var i = 0; i < data.length; i++){
        console.log(data[i].name);
        // console.log('open now: ' + data[i].opening_hours.open_now);
        // console.log('photos: ' + data[i].photos.length);
        // console.log('place ID: ' + data[i].place_id);
        // console.log(data[i].types);
      }
    }
  });
};

// getNearby(there);



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


var tweeted = function(err, data, response){
  if (err){
    console.log(err);
  } else {
    console.log(data.text);
  }
};

var tweet = function(text, image){
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
          var params = { status: text, media_ids: [mediaIdStr] };
     
          T.post('statuses/update', params, tweeted);
        }
      });
    });

  } else {

    T.post('statuses/update', {status: text}, tweeted);
  }

};





