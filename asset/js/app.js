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

var isConnected, upvoteStatus = true, flagStatus = true;
var projectsDisplayed = [];
var firstName;
var firstKnownKey;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        isLoggedIn(firebase.auth().currentUser);
    } else {
        isLoggedOut();
    }
});

function githubSignin() {
    firebase.auth().signInWithPopup(provider)

        .then(function (result) {
            firstName = firebase.auth().currentUser.displayName.split(" ")[0];
            checkForFirstTime(firebase.auth().currentUser.uid);
            //User Sucessfully Logged In
            toastr.success("Welcome, " + firstName + "!", "Successfully logged in.");

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            //User Log In Error
            toastr.error("Signin failed: " + errorCode + " - " + errorMessage);
        });
}

function githubSignout() {
    firebase.auth().signOut()

        .then(function () {

            window.location.reload();
            //User Log Out Successful, refresh page for content

        }, function (error) {

            toastr.error("Signout failed: " + error);

            //User Log Out Failed
        });
}

function isLoggedOut() {
    $("#gh-login").show();
    $("#gh-logout").hide();

    $("#logged-in-user").hide();
    $("#logged-out-user").show();
}

function isLoggedIn(user, token) {
    firstName = firebase.auth().currentUser.displayName.split(" ")[0];

    $("#gh-login").hide();
    $("#gh-logout").show();

    closeShipper();

    $("#userName").html(user.displayName);
    $("#fname-header").html(firstName + ", t");
    $("#useravatar").attr("src", user.photoURL);
    loadUpVotedProjects(firebase.auth().currentUser.uid);
    loadFlaggedProjects(firebase.auth().currentUser.uid);

    $("#logged-in-user").show();
    $("#logged-out-user").hide();

    initShipper();
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
    var shared = getParams("shared");
    if (shared != null) {
        getProp(shared);
        $("#launch").on("click", function () {
            window.location.replace("/?action=launch");
        });
    } else {
        query.limitToLast(10).on("child_added", function (snapshot) {
            if (!firstKnownKey) {
                firstKnownKey = snapshot.key;
            }
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
    try {
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
    } catch (e) {
        console.log("Warning: Unknown error occured. The content is successfully rendered.");
        console.log(e);
    }
}

function createProject() {
    if (isConnected == true) {
        var inputs = ["author", "name", "description", "liveLink", "codeLink", "username"];
        var completed = true;
        for (var i = 0; i < inputs.length - 1; i++) {
            $("#" + inputs[i]).attr('class', 'input');
            if (!$("#" + inputs[i]).val()) {
                $("#" + inputs[i]).addClass('is-danger');
                completed = false;
            }
        }
        if ($("#" + inputs[5]).val()) {
            completed = false;
        }
        if (!checkIfValidURL($("#" + inputs[3]).val())) {
            completed = false;
            $("#" + inputs[3]).addClass('is-danger');
        }
        if (!checkIfValidURL($("#" + inputs[4]).val())) {
            completed = false;
            $("#" + inputs[4]).addClass('is-danger');
        }
        if (completed) {
            if (firebase.auth().currentUser != null) {
                var newProjectRef = projectsRef.push();
                newProjectRef.set({
                    author: $("#" + inputs[0]).val(),
                    name: $("#" + inputs[1]).val(),
                    timestamp: getTimeStamp(),
                    desc: $("#" + inputs[2]).val(),
                    link: $("#" + inputs[3]).val(),
                    code: $("#" + inputs[4]).val(),
                    upvote: 0,
                    flagged: 0,
                    featured: "false",
                    uid: firebase.auth().currentUser.uid
                });
                closeShipper();

                initShipper();
            }
            else {
                toastr.error("You are not logged in... Cheater!");
            }
        }
        else {
            toastr.error("Shipping error: Check for fields in red!");
        }
    } else {
        //Mingjie work some css magic or something
    }
}

function initShipper() {

    var inputs = ["author", "name", "description", "liveLink", "codeLink", "username"];

    for (var i = 0; i < inputs.length; i++) {
        if (i != 0) {
            $("#" + inputs[i]).val("")
        }
        else {
            if (firebase.auth().currentUser != null) {
                $("#" + inputs[0]).val(firebase.auth().currentUser.displayName)
            }
        }
    }
}

function checkIfValidURL(value, ssl) {
    return value.substring(0, 4) == "http"
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
    if (firebase.auth().currentUser != null) {
        if (upvoteStatus) {
            upvoteStatus = false;
            checkIfAlreadyUpvoted(firebase.auth().currentUser.uid, key);
        }
    } else {
        forceLogin();
    }
}

function unVoteProject(userId, key) {
    try {
        var tempRef = database.ref("/users/" + userId + "/upVoted/" + key);
        tempRef.remove();
        $("#num" + key).text(parseInt($("#num" + key).text()) - 1);
        $("#num" + key).removeClass("is-danger");
        $("#num" + key).addClass("is-light");
        updateUpVoteCount(key, "subtract");
        upvoteStatus = true;
    }
    catch (e) {
        toastr.error("This is most likely because you are not logged in, or you are a cheater.", "Error unvoting.")
    }
}

function upVoteProject(userId, key) {
    try {
        var addUpVoteRef = database.ref("/users/" + userId + "/upVoted/" + key);
        var updates = {
            name: key
        };
        updateUpVoteCount(key, "add");
        $("#num" + key).removeClass("is-light");
        $("#num" + key).addClass("is-danger");
        $("#num" + key).text(parseInt($("#num" + key).text()) + 1);
        addUpVoteRef.update(updates);

        upvoteStatus = true;
    } catch (e) {
        toastr.error("This is most likely because you are not logged in, or you are a cheater.", "Error upvoting.")
    }
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
        try {
            buildPage(snapshot.val(), id);
        } catch (e) {
            toastr.error("Project not found!")
        }
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
        loadFlaggedProjects(userId);
    }
}

function loadUpVotedProjects(userId) {
    databaseRef.child('users').child(userId).child('upVoted').once('value', function (snapshot) {
        snapshot.forEach(function (data) {
            crossCheckProjects(data.val().name);
        });
    });
}

function loadFlaggedProjects(userId) {
    databaseRef.child('users').child(userId).child('flagged').once('value', function (snapshot) {
        snapshot.forEach(function (data) {
            crossFlagProjects(data.val().name);
        });
    });
}

function crossFlagProjects(key) {
    if (projectsDisplayed.indexOf(key) != -1) {
        $("#flag-" + key).html("<i class=\"fa fa-flag\"></i>");
    }
}

function crossCheckProjects(key) {
    if (projectsDisplayed.indexOf(key) != -1) {
        $("#num" + key).removeClass("is-light");
        $("#num" + key).addClass("is-danger");
    }
}

function loadMoreProjects(timestamp) {
    query.endAt(firstKnownKey).limitToLast(5).on('child_added', function (snapshot, prevChildKey) {
        if (!firstKnownKey) {
            firstKnownKey = snapshot.key;
        }
        displayProjects(snapshot.val(), snapshot.key); // adds post to a <div>
    });
}

function showUpvotedPage() {

    $("#loadButton").hide();
    $("#title-banner").html("Your upvoted collection...")

    projectsDisplayed = [];
    $("#shipped").html("");
    var checkRef = database.ref("/users/" + firebase.auth().currentUser.uid + "/upVoted/");
    checkRef.once('value', function (snapshot) {
        snapshot.forEach(function (data) {
            getProjectsFromKey(data.val())
        });
    });

}

function getProjectsFromKey(keys) {
    var testRef = database.ref("projects/" + keys.name);
    testRef.once("value", function (snapshot) {
        displayProjects(snapshot.val(), snapshot.key);
        $("#num" + snapshot.key).removeClass("is-light");
        $("#num" + snapshot.key).addClass("is-danger");
    });
}

function flagModal(uid) {
    $("#flag-modal" + uid).addClass("is-active");
    setTimeout(function(){
        $("#confirm-flag-" + uid).removeClass("is-loading");
        $("#confirm-flag-" + uid).attr("disabled", false);
    }, 3000);
}

function startFlag(uid) {
    if (firebase.auth().currentUser != null) {
        if (flagStatus) {
            flagStatus = false;
            checkIfAlreadyFlagged(firebase.auth().currentUser.uid, uid);
        }
    } else {
        forceLogin();
    }

}

function flagProj(uid) {
    var userId = firebase.auth().currentUser.uid;
    try {
        var addFlagRef = database.ref("/users/" + userId + "/flagged/" + uid);
        var updates = {
            name: uid
        };
        updateFlagCount(uid); 

        $("#flag-" + uid).html("<i class=\"fa fa-flag\"></i>");
        addFlagRef.update(updates);

        closeShipper();

        flagStatus = true;
    } catch (e) {
        console.log(e);
        toastr.error("This is most likely because you are not logged in, or you are a cheater.", "Error upvoting.")
    }
}

function checkIfAlreadyFlagged(userId, key) {
    var checkRef = database.ref("/users/" + userId + "/flagged/");
    var check = true;
    checkRef.once('value', function (snapshot) {
        if (snapshot.val() === null) {
            flagModal(key);
        } else {
            if (Object.keys(snapshot.val()).indexOf(key) != -1) {
                toastr.error("You have already flagged this post! You cannot unflag it.")
            } else {
                flagModal(key);
            }
        }
    });
}

function updateFlagCount(key) {
    var updateFlagRef = database.ref("/projects/" + key);
    updateFlagRef.once("value", function (snapshot) {
        updateFlagRef.update({ flagged: snapshot.val().flagged + 1 });
    });
}