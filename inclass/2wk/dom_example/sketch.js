var words = ['it','was','a','dark','and','stormy','night'];

function hoverWord() {
  // console.log(this.html());

  var word = this.html();

  this.style('background-color', 'black');
}

function setup() {
  noCanvas();

  var wordP = select("#words");
  
  for (var i = 0; i < words.length; i++) {
    var word = createSpan(words[i]);
    word.parent(wordP);
    word.mouseOver(hoverWord);

    var space = createSpan(" ");
    space.parent(wordP);
  }

  // var s = words.join(' ');
  // s.parent(wordP);
}