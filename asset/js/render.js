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