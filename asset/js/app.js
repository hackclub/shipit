// Initialize Firebase
var config = {
    apiKey: "AIzaSyB3m0F90sr7i5r4ma8pAWimovacR8LCNLc",
    authDomain: "shipit-f7171.firebaseapp.com",
    databaseURL: "https://shipit-f7171.firebaseio.com",
    projectId: "shipit-f7171",
    storageBucket: "",
    messagingSenderId: "454881075829"
};
firebase.initializeApp(config);

//Database Control
var database = firebase.database();

database.ref('/').once('value', function(snapshot){
  console.log(snapshot.val());
});