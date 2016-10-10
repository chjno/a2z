module.exports = {
  getRoute: function(start, end, goog){
    goog.directions({
      origin: start.coords,
      destination: end.coords,
      mode: 'walking',
      alternatives: false
    }, function(err, response){
      if (!err){
        this.updateRoute(end, response.json.routes[0]);
      }
      // else {
      //   end.newCoords(start.coords, true);
      // }
    });
  },

  updateRoute: function(obj, data){
    obj.route.name = data.summary;
    obj.route.distance = data.legs[0].distance.text;
    obj.route.duration = data.legs[0].duration.text;
    obj.route.endAddress = data.legs[0].end_address

    console.log(obj.route);
  }
}
