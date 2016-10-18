var p = {
  x: 100,
  y: 10,

  show: function(){
    point(this.x, this.y);
  }
}

/*
  why use below vs. above?
*/

function Particle(){
  this.x = 100;
  this.y = 10;

  ////////////////////////
  this.show = function(){
    point(this.x, this.y);
  }
  ////////////////////////
}

/*
  bad idea to attach function to prototype?

  all objects created from Particle() prototype
*/

Particle.prototype.show = function(){
  point(this.x, this.y);
}

/*
  attaching a function to a prototype like this can happen after the fact / dynamically
    applies to all objects
*/