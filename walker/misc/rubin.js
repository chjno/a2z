var myfunction( val, callback ){

  var otherval = val;

  if(callback && typeof(callback) == "function"){
    callback();
  }
      
}


myfunction(24, function(){

  console.log("hi");

});


dog.init({
  color: "red",
  age: 4,
  name: "peter",
});


var dog = {

  attributes : {},

};

dog.init = function(obj){

  if(obj.color){
    dog.attributes["color"] = obj.color
  }

}