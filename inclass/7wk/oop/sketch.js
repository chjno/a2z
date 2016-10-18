Array.prototype.unicorn = function(){
  console.log('unicorn');
}

Array.prototype.choice = function(){
  var i = floor(random(this.length));
  return this[i];
}

var arr = [5,6,7,1,2,3,4];

function setup() {
  noCanvas();

  
  console.log(arr);
  arr.sort();
  console.log(arr);
}