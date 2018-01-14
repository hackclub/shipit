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
