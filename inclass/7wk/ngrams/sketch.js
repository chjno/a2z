// var txt = "the quick brown fox jumped over the lazy dog.";
var txt = 'abcdabceabckabciabcuabcpabcjabcgabcd';

var order = 3;
var ngrams = {};

function setup() {
  noCanvas();
  console.log(txt);

  for (var i = 0; i <= txt.length - order; i++){
    var gram = txt.substring(i, i + order);

    if (!ngrams[gram]){
      ngrams[gram] = [];
      ngrams[gram].push(txt.charAt(i + order));
    } else {
      ngrams[gram].push(txt.charAt(i + order));
    }

    // if (ngrams[gram]){
    //   ngrams[gram]++;
    // } else {
    //   ngrams[gram] = 1;
    // }

  }

  button = createButton('generate');
  button.mousePressed(markovGo);

  console.log(ngrams);
}

function markovGo(){

  var currentGram = txt.substring(0, order);
  var result = '';
  var count = 0;

  // one way is to run until it gets to a line break
  while (count < 15){
    var possibilities = ngrams[currentGram];
    console.log(possibilities);

    var next = random(possibilities);
    result += next;
    count++;
    currentGram = result.substring(result.length - order, result.length);

  }

  createP(result);
}