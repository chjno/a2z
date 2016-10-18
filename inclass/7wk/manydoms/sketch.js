function setup(){

  createCanvas(100, 100);

  for (var i = 0; i < 10000; i++){
    // makeSpan(i);
    setSpanTime(i);
  }

}

// function makeSpan(i){
//   var span = createSpan(i + ' ');
// }

function setSpanTime(val){

  setTimeout(makeSpan, val * 1);

  function makeSpan(){
    var span = createSpan(val + " ");
  }

}

function draw(){

  line(background(0));
  stroke(255);
  line(frameCount % width, 0, frameCount % width, height);

}