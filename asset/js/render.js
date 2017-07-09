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

function shareShipment(uuid) {
    $("#share-modal").addClass("is-active");
}