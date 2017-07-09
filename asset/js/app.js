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

projectsRef.on("child_added", function(snapshot){
  displayProjects(snapshot.val())
});

function displayProjects(data){
		var newProject = {
			author: data.author,
			name: data.name,
			timestamp: convertTimestamp(data.timestamp),
			desc: data.desc,
			link: data.link,
			code: data.code,
			upvote: data.upvote
		}
		loadShipment(newProject)
}

function createProject(){
	var inputs = [document.getElementById("author"),document.getElementById("name"),document.getElementById("description"),document.getElementById("liveLink"),document.getElementById("codeLink")]
	var completed = true;
	for(var i = 0;i<inputs.length;i++)
	{
		inputs[i].className = "input"
		if(inputs[i].value == "" || undefined || null)
		{
			inputs[i].className += " is-danger"
			completed = false;
		}
	}
	if(completed == true)
	{
	  var newProjectRef = projectsRef.push();
	  newProjectRef.set({
	    author: inputs[0].value,
	    name: inputs[1].value,
	   	timestamp: getTimeStamp(),
	   	desc: inputs[2].value,
	   	link: inputs[3].value,
	   	code: inputs[4].value,
	   	upvote: 0,
	   	featured: "false"
	  });
	  closeShipper();
	}
}

function convertTimestamp(id){
	var currentDate = new Date(id);
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

function getTimeStamp(){
	var date = Date.now()
	console.log(date)
	return date;
}