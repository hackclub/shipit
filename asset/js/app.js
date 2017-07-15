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
const query = database.ref("/projects").orderByChild("timestamp");
const connectedRef = database.ref(".info/connected");
const databaseRef = database.ref("/");

var isConnected, upvoteStatus = true;
var projectsDisplayed = [];

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        isLoggedIn(firebase.auth().currentUser);
    } else {
        //User Not Logged In
    }
});

function githubSignin() {
    firebase.auth().signInWithPopup(provider)

        .then(function (result) {
            checkForFirstTime(firebase.auth().currentUser.uid);
            //User Sucessfully Logged In

            isLoggedIn(firebase.auth().currentUser, result.credential.accessToken);
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            console.log(error.code);
            console.log(error.message);
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
}

function isLoggedIn(user, token) {
    $("#gh-login").hide();
    $("#gh-logout").show();

    $("#userName").html(user.displayName);
    var name = (user.displayName).split(" ");
    $("#fname-header").html(name[0] + ", t");
    $("#useravatar").attr("src", user.photoURL);
    loadUpVotedProjects(firebase.auth().currentUser.uid);
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
        $("#launch").on("click", function () {
            window.location.replace("/?action=launch");
        });
    } else {
        query.limitToLast(5).on("child_added", function (snapshot) {
            displayProjects(snapshot.val(), snapshot.key);
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
    projectsDisplayed.push(key);
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
    $("#loadButton").attr("onclick", "loadMoreProjects('" + data.timestamp + "')")
    loadShipment(newProject);
}

function createProject() {
    if (isConnected == true) {
        var inputs = [document.getElementById("author"), document.getElementById("name"), document.getElementById("description"), document.getElementById("liveLink"), document.getElementById("codeLink"), document.getElementById("username")];
        var completed = true;
        for (var i = 0; i < inputs.length - 1; i++) {
            inputs[i].className = "input";
            if (inputs[i].value == "" || undefined || null) {
                inputs[i].className += " is-danger";
                completed = false;
            }
        }
        if (inputs[5].value) {
            completed = false;
        }
        if (!checkIfValidURL(inputs[3].value, false)) {
            completed = false;
            inputs[3].className += " is-danger";
        }
        if (!checkIfValidURL(inputs[4].value, true)) {
            completed = false;
            inputs[4].className += " is-danger";
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

function checkIfValidURL(value, ssl) {
    if (ssl) {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    } else {
        return /^(?:(?:(?:http?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
    }
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
    var date = Date.now();
    return date;
}

function startUpVote(key) {
    if (upvoteStatus) {
        upvoteStatus = false;
        checkIfAlreadyUpvoted(firebase.auth().currentUser.uid, key);
    }
}

function unVoteProject(userId, key) {
    var tempRef = database.ref("/users/" + userId + "/upVoted/" + key);
    tempRef.remove();
    $("#num" + key).text(parseInt($("#num" + key).text()) - 1);
    $("#" + key).removeClass("is-danger");
    
    upvoteStatus = true;
}

function upVoteProject(userId, key) {
    var addUpVoteRef = database.ref("/users/" + userId + "/upVoted/" + key);
    var updates = {
        name: key
    };
    updateUpVoteCount(key, "add");
    $("#num" + key).text(parseInt($("#num" + key).text()) + 1);
    addUpVoteRef.update(updates);


    $("#" + key).addClass("is-danger");

    upvoteStatus = true;
}

function updateUpVoteCount(key, state) {
    var updateUpVoteRef = database.ref("/projects/" + key);
    updateUpVoteRef.once("value", function (snapshot) {
        if (state === "add") {
            updateUpVoteRef.update({ upvote: snapshot.val().upvote + 1 });
        }
        else {
            updateUpVoteRef.update({ upvote: snapshot.val().upvote - 1 });
        }
    });
}

function checkIfAlreadyUpvoted(userId, key) {
    var checkRef = database.ref("/users/" + userId + "/upVoted/");
    var check = true;
    checkRef.once('value', function (snapshot) {
        if (snapshot.val() === null) {
            upVoteProject(userId, key);
        } else {
            if (Object.keys(snapshot.val()).indexOf(key) != -1) {
                unVoteProject(userId, key);
            } else {
                upVoteProject(userId, key);
            }
        }
    });
}

function getProp(id) {
    var specificRef = database.ref("/projects/" + id)
    specificRef.once("value", function (snapshot) {
        buildPage(snapshot.val(), id);
    });
}

function buildPage(data, key) {
    displayProjects(data, key);
}

function addNewUser(userId) {
    console.log('test')
    var newUserRef = database.ref("/users/" + userId)
    var updates = {};
    newUserRef.set({
        name: firebase.auth().currentUser.displayName,
        upvoted: null,
        projects: null
    });
}

function checkForFirstTime(userId) {
    databaseRef.child('users').child(userId).once('value', function (snapshot) {
        var exists = (snapshot.val() !== null);
        userFirstTimeCallback(userId, exists);
    });
}

function userFirstTimeCallback(userId, exists) {
    if (!exists) {
        addNewUser(userId);
    } else {
        loadUpVotedProjects(userId);
    }
}

function loadUpVotedProjects(userId) {
    databaseRef.child('users').child(userId).child('upVoted').once('value', function (snapshot) {
        snapshot.forEach(function (data) {
            crossCheckProjects(data.val().name);
        });
    });
}

function crossCheckProjects(key) {
    if (projectsDisplayed.indexOf(key) != -1) {
        $("#" + key).addClass("is-danger");
    }
}

function loadMoreProjects(timestamp) {
    //,displayProjects[displayProjects.length-1]
    query.startAt(timestamp, displayProjects[displayProjects.length - 1]).limitToLast(6).on("child_added", function (snapshot) {
        displayProjects(snapshot.val(), snapshot.key);
        console.log(snapshot.val())
    });
}