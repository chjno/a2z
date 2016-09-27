console.log('this is my bot');
var twit = require('twit');

var config = require('./config.js');

var T = new twit(config);

T.post('statuses/update', {status: 'My first tweet'}, tweeted);

function tweeted(err, data, response) {
  if (err) {
    console.log(err);
  } else {
    console.log('Success: ' + data.text);
  }
};


// setInterval(tweet, 60*5*1000);