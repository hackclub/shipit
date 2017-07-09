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
const projectsRef = database.ref("/projects");

var context = [
    {
        author: "zachlatta",
        name: "Hack Club",
        timestamp: "11:09 PM - 7 Jul 2017",
        desc: "We help high schoolers start awesome after-school coding clubs!",
        link: "https://hackclub.com",
        code: "https://github.com/hackclub/hackclub",
        upvote: 255
    },
    {
        author: "bgates",
        name: "Mircosoft Windows",
        timestamp: "12:00 AM - 25 Jun 1998 ",
        desc: "The operating system for modern devices... Like my IBM ThinkPad i1300!",
        link: "https://windows.microsoft.com",
        code: "https://github.com/microsoft",
        upvote: 255
    }
]

projectsRef.once('value', function(snapshot){
	snapshot.forEach(function(data){
    displayProjects(data.val())
  });
  loadShipment();
});

function displayProjects(data){
		var newProject = {
			author: data.author,
			name: data.name,
			timestamp: data.timestamp,
			desc: data.desc,
			link: data.link,
			code: data.code,
			upvote: data.upvote
		}
		context.push(newProject)
}

