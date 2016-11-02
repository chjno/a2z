var creds = require('./creds.js');
var gmap = require('@google/maps').createClient({
  key: creds.g
});

var getRoute = function(origin, destination){

  gmap.directions({
    origin: origin,
    destination: destination,
    mode: 'walking',
    alternatives: false
  }, function(err, response){
    if (!err){
      if (response.json.routes.length > 0){

        var data = response.json.routes[0];
        var route = {};
        route.name = data.summary;
        route.distance = data.legs[0].distance;
        route.duration = data.legs[0].duration;
        route.endAddress = data.legs[0].end_address;
        route.endCoords = data.legs[0].end_location;

        console.log(route);

      } else {
        console.log('no route to destination');
      }
    } else {
      console.log('err');
    }
  });
};

getRoute([39.967627, -98.042574], [25.925139, -93.456791]);
