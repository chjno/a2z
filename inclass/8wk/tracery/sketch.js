var story = {
  // [character:#animal#] lets you use one chosen word throughout story
  'start': '#[character:#animal#]story#',
  // .s makes word plural, .s inserts 'a' before word
  'story': 'The #character.s# meowed. The #character# slept. There was #character.a#',
  'animal': ['cat','turtle','kangaroo']
};

function setup() {

  noCanvas();

  var grammar = tracery.createGrammar(story);

  var output = grammar.flatten("#start#");
  console.log(output);

}