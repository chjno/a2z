incomplete

function setup() {
  createCanvas(100, 100);
  background(100);
  loadJSON('/all', gotData);

  input1 = createInput('word');
  input2 = createInput('score');
  var button = createButton('submit');
  button.mousePressed(submitData);
  function submitData(){
    loadJSON('/add/' + input1.value + '/' + input2.value, submitted);

  }
}

function gotData(data){
  console.log(data);
}

function draw() {
  
}