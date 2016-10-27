exports.Wiki = function(module){
  this.req = module;
};

exports.Wiki.prototype.query = function(q){

  var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + q;

  this.req(url, function (err, response, body){
    if (!err){
      var wikiData = JSON.parse(body);
      console.log(wikiData[2].join(' '));
    } else {
      console.log('wiki error');
      console.log(err);
    }
  });

};