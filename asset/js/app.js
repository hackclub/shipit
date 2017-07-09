//Database Control
var database = firebase.database();

database.ref('/').once('value', function(snapshot){
  console.log(snapshot.val());
});