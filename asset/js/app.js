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
var firstName;
var firstKnownKey, lastProjLoaded, queryIr = 0,
    sfired = false;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        isLoggedIn(firebase.auth().currentUser);
    }
    else {
        isLoggedOut();
    }
});

function githubSignin() {
    firebase.auth().signInWithRedirect(provider)

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
    $("#gh-logout").hide();

    $("#logged-in-user").hide();
    $("#logged-out-user").show();
}

function isLoggedIn(user, token) {
    firstName = firebase.auth().currentUser.displayName.split(" ")[0];

    //Google Analytics
    ga('set', 'userId', firebase.auth().currentUser.uid); // Set the user ID using signed-in user_id.

    $("#gh-logout").show();

    closeShipper();

    $("#userName").html(user.displayName);
    $("#fname-header").html(firstName + ", s");
    $("#useravatar").attr("src", user.photoURL);
    loadUpVotedProjects(firebase.auth().currentUser.uid);
    loadFlaggedProjects(firebase.auth().currentUser.uid);

    $("#logged-in-user").show();
    $("#logged-out-user").hide();
}

function getSL(dest) {
    $.ajax({
        url: "https://api.rebrandly.com/v1/links",
        type: "post",
        data: JSON.stringify({
            "destination": "https://shipit.hackclub.com/?shared=" + dest,
            "domain": {
                "id": "c8e958cfc21c4a6d8b94ed1690e8cfc4"
            },
            "title": "Shipit:" + firebase.auth().currentUser.displayName + " / " + firebase.auth().currentUser.uid + " / " + getTimeStamp(),
            "team": "11eb9668b45643aa8911a853f8f3e624"
        }),
        headers: {
            "team": "11eb9668b45643aa8911a853f8f3e624",
            "Content-Type": "application/json",
            "apikey": "1e766d2359454af3bdc8aa52353903a4",

        },
        dataType: "json",
        success: function (link) {
            $("#share-id" + dest).attr("value", "https://" + link.shortUrl);
            $("#share-twitter" + dest).attr("onclick", "shareTwitter(\"https://" + link.shortUrl + "\")");
        }
    });
}

function shortLinkForSlack(author, name, plink, code, desc, ts, dest) {
    $.ajax({
        url: "https://api.rebrandly.com/v1/links",
        type: "post",
        data: JSON.stringify({
            "destination": "https://shipit.hackclub.com/?shared=" + dest,
            "domain": {
                "id": "c8e958cfc21c4a6d8b94ed1690e8cfc4"
            },
            "title": "Shipit:" + firebase.auth().currentUser.displayName + " / " + firebase.auth().currentUser.uid + " / " + getTimeStamp(),
            "team": "11eb9668b45643aa8911a853f8f3e624"
        }),
        headers: {
            "team": "11eb9668b45643aa8911a853f8f3e624",
            "Content-Type": "application/json",
            "apikey": "1e766d2359454af3bdc8aa52353903a4",

        },
        dataType: "json",
        success: function (link) {
            makeSlackCall(author, name, plink, code, desc, ts, "https://" + link.shortUrl);
        }
    });
}

function shareTwitter(dest) {
    window.location.href = "http://twitter.com/share?text=Another wonderful project by a Hack Club member: &url=" + dest + "&via=starthackclub&related=starthackclub";
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
    database.ref("/featured").once("value")
        .then(function (snapshot) {
            var featuredKey = snapshot.val()["featured"].toString();

            var editorNotes = snapshot.val()["notes"].toString();

            query.once("value").then(function (projSnap) {
                console.log(featuredKey);
                displayFeatured(projSnap.child(featuredKey).val(), featuredKey, editorNotes);
            });

    });

    var shared = getParams("shared");
    if (shared != null) {
        getProp(shared);
        $("#launch").on("click", function () {
            window.location.replace("/?action=launch");
        });
    }
    else {

        query.limitToLast(10).on("child_added", function (snapshot) {
            if (!firstKnownKey) {
                firstKnownKey = snapshot.key;
            }
            displayProjects(snapshot.val(), snapshot.key);
            if (!lastProjLoaded) {
                lastProjLoaded = snapshot.val().timestamp;
            }
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
    }
    else {
        isConnected = false;
    }
});


function displayFeatured(data, key, ednote) {
    try {
        var newProject = {
            author: data.author,
            name: data.name,
            timestamp: convertTimestamp(data.timestamp),
            desc: data.desc,
            link: data.link,
            code: data.code,
            upvote: data.upvote,
            ednote: ednote,
            uid: key
        }
        loadFeatured(newProject);
        $("#project" + key).css("display", "none");
    }
    catch (e) {
        console.log("Warning: Unknown error occured. The content is successfully rendered.");
        console.log(e);
    }
}

function displayProjects(data, key) {
    try {
        projectsDisplayed.push(key);
        var featuredStatus = "";
        var featuredShow = "none";
        if (data.featured != "false") {
            featuredStatus = "Featured in " + data.featured;
            featuredShow = "normal";
        }
        var newProject = {
            author: data.author,
            name: data.name,
            timestamp: convertTimestamp(data.timestamp),
            desc: data.desc,
            link: data.link,
            code: data.code,
            upvote: data.upvote,
            featured: featuredStatus,
            featuredShow: featuredShow,
            uid: key
        }
        $("#loadButton").attr("onclick", "loadMoreProjects('" + data.timestamp + "')")
        loadShipment(newProject);
    }
    catch (e) {
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
                var ts = getTimeStamp();
                var newProjectRef = projectsRef.push();
                newProjectRef.set({
                    author: $("#" + inputs[0]).val(),
                    name: $("#" + inputs[1]).val(),
                    timestamp: ts,
                    desc: $("#" + inputs[2]).val(),
                    link: $("#" + inputs[3]).val(),
                    code: $("#" + inputs[4]).val(),
                    upvote: 0,
                    flagged: 0,
                    featured: "false",
                    uid: firebase.auth().currentUser.uid
                });

                shortLinkForSlack($("#" + inputs[0]).val(), $("#" + inputs[1]).val(), $("#" + inputs[3]).val(), $("#" + inputs[4]).val(), $("#" + inputs[2]).val(), ts, newProjectRef.key);

                var addShippedRef = database.ref("/users/" + firebase.auth().currentUser.uid + "/shipped/" + newProjectRef.key);
                var updates = {
                    name: newProjectRef.key
                };
                addShippedRef.update(updates);
            }
            else {
                toastr.error("You are not logged in... Cheater!");
            }
        }
        else {
            toastr.error("Shipping error: Check for fields in red!");
        }
    }
    else {
        //Mingjie work some css magic or something
    }
}

function makeSlackCall(author, name, link, code, desc, ts, uvurl) {
    var url = "68747470733a2f2f686f6f6b732e736c61636b2e636f6d2f73657276696365732f54303236364652474d2f42384d5458385a345a2f614e6431654f575a574b6630715644596632524b4b757966";

    $.ajax({
        data: 'payload=' + JSON.stringify({
            "attachments": [{
                "fallback": "New project from *" + author + "*: " + name + "\nView Project: " + uvurl,
                "pretext": "New project from *" + author + "* - click title to upvote!",
                "title": name,
                "title_link": uvurl,
                "text": desc + "\n*Get it*: " + link + "\n*Source*: " + code,
                "color": getRandomColor(),
                "ts": Math.floor(ts / 1000)
            }]
        }),
        dataType: 'json',
        processData: false,
        type: 'POST',
        url: hts(url),
        success: finishShipper()
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function hts(h) {
    var hex = h.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
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
    }
    else {
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
    }
    catch (e) {
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
        }
        else {
            if (Object.keys(snapshot.val()).indexOf(key) != -1) {
                unVoteProject(userId, key);
            }
            else {
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
        }
        catch (e) {
            toastr.error("Project not found!")
        }
    });
}

function buildPage(data, key) {
    displayProjects(data, key);
}

function addNewUser(userId) {
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
    }
    else {
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
        $("#project" + key).hide();
    }
}

function crossCheckProjects(key) {
    if (projectsDisplayed.indexOf(key) != -1) {
        $("#num" + key).removeClass("is-light");
        $("#num" + key).addClass("is-danger");
    }
}

function loadMoreProjects() {
    queryIr = 5;
    requestNextProj(lastProjLoaded);
}

function requestNextProj(ts) {
    if (queryIr > 0) {
        try {
            query.endAt(ts - 1, "timestamp").limitToLast(1).on('child_added', function (snapshot, prevChildKey) {
                displayProjectsDown(snapshot.val(), snapshot.key);
                requestNextProj(snapshot.val().timestamp);
                queryIr--;
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    lastProjLoaded = ts;
    loadUpVotedProjects(firebase.auth().currentUser.uid);
    loadFlaggedProjects(firebase.auth().currentUser.uid);
    sfired = false;
}


function displayProjectsDown(data, key) {
    try {
        projectsDisplayed.push(key);
        var featuredStatus = "";
        var featuredShow = "none";
        if (data.featured != "false") {
            featuredStatus = "Featured in " + data.featured;
            featuredShow = "normal";
        }
        var newProject = {
            author: data.author,
            name: data.name,
            timestamp: convertTimestamp(data.timestamp),
            desc: data.desc,
            link: data.link,
            code: data.code,
            upvote: data.upvote,
            featured: featuredStatus,
            featuredShow: featuredShow,
            uid: key
        }
        $("#loadButton").attr("onclick", "loadMoreProjects('" + data.timestamp + "')")
        $("#shipped-placeholder").slideUp("slow");
        $("#shipped").append(template(newProject));
        $(".unlaunch").on("click", closeShipper);
        $(".modal-background").on("click", closeShipper);
    }
    catch (e) {
        console.log("Warning: Unknown error occured. The content is successfully rendered.");
        console.log(e);
    }
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

function showShippedPage() {
    $("#loadButton").hide();
    $("#title-banner").html("Your shipped projects...")

    projectsDisplayed = [];
    $("#shipped").html("");
    var checkRef = database.ref("/users/" + firebase.auth().currentUser.uid + "/shipped/");
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
    setTimeout(function () {
        $("#confirm-flag-" + uid).removeClass("is-loading");
        $("#confirm-flag-" + uid).attr("disabled", false);
    }, 3000);
}

function startFlag(uid) {
    if (firebase.auth().currentUser != null) {
        checkIfAlreadyFlagged(firebase.auth().currentUser.uid, uid);
    }
    else {
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
        $("#project" + uid).hide();
        addFlagRef.update(updates);

        closeShipper();
    }
    catch (e) {
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
        }
        else {
            if (Object.keys(snapshot.val()).indexOf(key) != -1) {
                toastr.error("You have already flagged this post! You cannot unflag it.")
            }
            else {
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
