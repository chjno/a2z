var fs = require('fs');

var data = fs.readFileSync('words.json');
var words = JSON.parse(data);

var express = require('express');
var app = express();
app.use(express.static('public'));

var server = app.listen(process.env.PORT || 3000, listen);

// var words = {};

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

// : in path indicates variable (RESTian)
app.get('/add/:word/:score/', addWord);
app.get('/search/:word/', searchWord);
app.get('/all', getAll);

function addWord(req, res){
  var data = req.params;
  words[data.word] = data.score;

  function finished(){
    console.log('finished');
  }

  var json = JSON.stringify(words, null, 2);
  fs.writeFile('words.json', json, finished);

  res.send({
    status: 'success',
    word: data.word,
    score: data.score
  });
}

function searchWord(req, res){
  var txt = req.params.word;
  var reply;
  if (words[txt]){
    reply = {
      msg: 'found it',
      word: txt,
      score: words[txt]
    };
  } else {
    reply = {
      msg: 'not found'
    };
  }
  res.send(reply);
}

function getAll(req, res){
  res.send(words);

}