// $(function () {
//     loadShipment();
// });

var shipment = $("#shipment-templ").html();
var template = Handlebars.compile(shipment);

//Sample - To be replaced by GET db content
// var context = {
//     0: {
//         author: "zachlatta",
//         name: "Hack Club",
//         timestamp: "11:09 PM - 7 Jul 2017",
//         desc: "We help high schoolers start awesome after-school coding clubs!",
//         link: "https://hackclub.com",
//         code: "https://github.com/hackclub/hackclub",
//         upvote: 255
//     },
//     1: {
//         author: "bgates",
//         name: "Mircosoft Windows",
//         timestamp: "12:00 AM - 25 Jun 1998 ",
//         desc: "The operating system for modern devices... Like my IBM ThinkPad i1300!",
//         link: "https://windows.microsoft.com",
//         code: "https://github.com/microsoft",
//         upvote: 255
//     }
// }

function loadShipment() {
    $("#shipped-placeholder").hide();
    console.log(context)
    for (var i = 0; i < Object.keys(context).length; i++) {
        $("#shipped").append(template(context[i]));
    }
}