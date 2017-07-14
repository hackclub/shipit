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
const provider = new firebase.auth.GithubAuthProvider();
const database = firebase.database();
const projectsRef = database.ref("/projects");
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const query = database.ref("/projects").orderByValue().limitToLast(5);
const connectedRef = database.ref(".info/connected");

var isConnected, userUID, userData;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
	userData = firebase.auth().currentUser;
	userUID = userData.uid;
	isLoggedIn(userData);
  } else {
	//User Not Logged In
  }
});

function githubSignin() {
	firebase.auth().signInWithPopup(provider)

		.then(function (result) {
			var token = result.credential.accessToken;
			userData = result.user;
            userUID = userData.uid;
			console.log(token)
			console.log(userData)
			//User Sucessfully Logged In

			isLoggedIn(userData, token);
		}).catch(function (error) {
			var errorCode = error.code;
			var errorMessage = error.message;

			console.log(error.code)
			console.log(error.message)
			//User Log In Error
		});
}

function githubSignout() {
	firebase.auth().signOut()

		.then(function () {
			console.log('Signout successful!');

			//User Log Out Successful
			isLoggedOut();
		}, function (error) {
			console.log('Signout failed');

			//User Log Out Failed
		});
}

function isLoggedOut() {
	$("#gh-login").show();
	$("#gh-logout").hide();

	$("#userName").html("Not Signed In");
	$("#useravatar").attr("src", "");

	userData = undefined;
}

function isLoggedIn(user, token) {
	$("#gh-login").hide();
	$("#gh-logout").show();

	$("#userName").html(user.displayName);
	var name = (user.displayName).split(" ");
	$("#fname-header").html(name[0] + ", t");
	$("#useravatar").attr("src", user.photoURL);
}

function getParams(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(function () {
	new Clipboard('#copy-share-link');
	var shared = getParams("shared");
	if (shared != null) {
		getProp(shared);
		$("#launch").on("click", function() {
			window.location.replace("/?action=launch");
		});
	} else {
		query.on("child_added", function (snapshot) {
			displayProjects(snapshot.val(), snapshot.key)
		});
	}
	var action = getParams("action");
	if (action == "launch") {
		openShipper();
	}
});

connectedRef.on("value", function (snapshot) {
	if (snapshot.val() == true) {
		isConnected = true;
	} else {
		isConnected = false;
		//Mingjie work some css magic
	}
});



function displayProjects(data, key) {
	var newProject = {
		author: data.author,
		name: data.name,
		timestamp: convertTimestamp(data.timestamp),
		desc: data.desc,
		link: data.link,
		code: data.code,
		upvote: data.upvote,
		uid: key
	}
	loadShipment(newProject)
}

function createProject() {
	if (isConnected == true) {
		var inputs = [document.getElementById("author"), document.getElementById("name"), document.getElementById("description"), document.getElementById("liveLink"), document.getElementById("codeLink"), document.getElementById("username")]
		var completed = true;
		for (var i = 0; i < inputs.length - 1; i++) {
			inputs[i].className = "input"
			if (inputs[i].value == "" || undefined || null) {
				inputs[i].className += " is-danger"
				completed = false;
			}
		}
		if (inputs[5].value) {
			completed = false;
		}
		if(!checkIfValidURL(inputs[3].value))
		{
			completed = false;
			inputs[3].className += " is-danger"
		}
		if(!checkIfValidURL(inputs[4].value))
		{
			completed = false;
			inputs[4].className += " is-danger"
		}
		if (completed) {
			var newProjectRef = projectsRef.push();
			newProjectRef.set({
				author: inputs[0].value,
				name: inputs[1].value,
				timestamp: getTimeStamp(),
				desc: inputs[2].value,
				link: inputs[3].value,
				code: inputs[4].value,
				upvote: 0,
				featured: "false",
                uid: firebase.auth().currentUser.uid
			});
			closeShipper();
		}
	} else {
		//Mingjie work some css magic or something
	}
}

function checkIfValidURL(link){
	$.ajax({
    type: 'HEAD',
    url: link,
	success: function() {
		console.log("test")
		return true;
	},
	error: function() {
		console.log('test2')
	    return false
	}
	});
}

function convertTimestamp(id) {
	var currentDate = new Date(id);
	var hours = currentDate.getHours();
	var minutes = currentDate.getMinutes();
	var dd = currentDate.getDate();
	var mm = monthNames[currentDate.getMonth()]
	var yyyy = currentDate.getFullYear();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime + " - " + dd + " " + mm + " " + yyyy;
}

function getTimeStamp() {
	var date = Date.now()
	return date;
}

function upVote(key) {

}

function getProp(id) {
	var specificRef = database.ref("/projects/" + id)
	specificRef.once("value", function (snapshot) {
		buildPage(snapshot.val(), id);
	});
}

function buildPage(data, key) {
	displayProjects(data, key)
}