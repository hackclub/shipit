var shipment = $("#shipment-templ").html();
var template = Handlebars.compile(shipment);

function loadShipment(id) {
    $("#shipped-placeholder").hide();
    $("#shipped").prepend(template(id));
}

$("#launch").on("click", openShipper);
$(".modal-close").on("click", closeShipper);

function openShipper() {
    console.log(firebase.auth().currentUser);
    if (firebase.auth().currentUser != null) {
        $("#ship-modal").addClass("is-active");
    } else {
        forceLogin();
    }
}

function forceLogin() {
    $("#login-modal").addClass("is-active");
}

function closeShipper() {
    $(".modal").removeClass("is-active");
}

function shareShipment(uid) {
    $("#share-id").attr("value", "https://shipit.tech/?shared=" + uid);
    $("#share-modal").addClass("is-active");
}

function shareTwitter() {
    window.location.href = "http://twitter.com/share?text=I found a wonderful project created by a Hack Club member!&url=" + $("#share-id").attr("value") + "&via=starthackclub&related=starthackclub";
}

$.get("https://api.github.com/repos/mj66/shipit-frontend/commits", function (data, status) {
    $("#commit-id").html(data[0].sha);
    $("#commit-id").attr("href", data[0].html_url);
    $("#commit-id").attr("title", data[0].commit.message);
});