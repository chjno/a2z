var creds = require('./creds.js');
var gmap = require('@google/maps').createClient({
  key: creds.g
});



var here = {
  coords: [39.967627, -98.042574],
};

var there = {
  coords: [],
  route: {},
  // time:

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
  }
};



getRoute = function(start, end){
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
      there.route.duration = data.legs[0].duration.text;
      there.route.endAddress = data.legs[0].end_address

      console.log(there.route);
    }
  });
}

there.newCoords(here);
getRoute(here, there);



getNearby = function(location){
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
}

getNearby(there);



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
// }