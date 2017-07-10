$(function () {
    var shared = getParams("shared");
    if (shared != null) {
        //Stop running get all, only display the requested card
    }
    new Clipboard('#copy-share-link');
});

var shipment = $("#shipment-templ").html();
var template = Handlebars.compile(shipment);

//Sample - To be replaced by GET db content
//         {
//         author: "zachlatta",
//         name: "Hack Club",
//         timestamp: "11:09 PM - 7 Jul 2017",
//         desc: "We help high schoolers start awesome after-school coding clubs!",
//         link: "https://hackclub.com",
//         code: "https://github.com/hackclub/hackclub",
//         upvote: 255
//         uuid: 125121
//         }

function loadShipment(id) {
    $("#shipped-placeholder").hide();
    $("#shipped").prepend(template(id));
}

$("#launch").on("click", openShipper);
$(".modal-close").on("click", closeShipper);

function openShipper() {
    $("#ship-modal").addClass("is-active");
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

function getParams(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
