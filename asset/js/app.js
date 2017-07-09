// Initialize Firebase
var config = {
	apiKey: "AIzaSyD-IT1RWXi-7bMSjtTsPmpaTD2SXadFxC0",
	authDomain: "shipit-7427d.firebaseapp.com",
	databaseURL: "https://shipit-7427d.firebaseio.com",
	projectId: "shipit-7427d",
	storageBucket: "",
  messagingSenderId: "601650858338"
};
firebase.initializeApp(config);

//Database Control
const database = firebase.database();
const projectsRef = databse.ref("/projects");

function createProject(){
  var newProjectRef = projectsRef.push();
  newProjectRef.set({
    author: document.getElementById("name").value,
   	timestamp: document.getElementById("time").value,
   	desc: document.getElementById("description").value,
   	link: document.getElementById("liveLink").value,
   	code: document.getElementById("codeLink").value,
   	upvote: 0,
   	featured: "false"
  });
}