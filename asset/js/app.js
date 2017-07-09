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
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


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

function createProject(){
  var newProjectRef = projectsRef.push();
  newProjectRef.set({
    author: document.getElementById("name").value,
   	timestamp: getTimeStamp(),
   	desc: document.getElementById("description").value,
   	link: document.getElementById("liveLink").value,
   	code: document.getElementById("codeLink").value,
   	upvote: 0,
   	featured: "false"
  });
}

function getTimeStamp(){
	var currentDate = new Date();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var dd = currentDate.getDate();
	var mm = monthNames[currentDate.getMonth()]
	var yyyy = currentDate.getFullYear();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime + " - " +dd + " " + mm + " " +yyyy;
}
