function setup() {
  var config = {
    apiKey: "AIzaSyBr0ACnXolnvIbVhqudJ-KIbTyRE4NJmk0",
    authDomain: "walker-66a5f.firebaseapp.com",
    databaseURL: "https://walker-66a5f.firebaseio.com",
    storageBucket: "walker-66a5f.appspot.com",
    messagingSenderId: "30207699711"
  };
  firebase.initializeApp(config);

  var db = firebase.database();
  var ref = db.ref('fruits');
  var data = {
    fruit: 'mango',
    total: 16
  };
  var result = ref.push(data, finished);
  console.log(result.key);

  function finished(res) {
    console.log(res);
  }
}