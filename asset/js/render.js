var shipment = $("#shipment-templ").html();
var template = Handlebars.compile(shipment);

toastr.options.showMethod = 'slideDown';
toastr.options.hideMethod = 'slideUp';
toastr.options.closeMethod = 'slideUp';
toastr.options.showEasing = 'swing';
toastr.options.hideEasing = 'linear';
toastr.options.closeEasing = 'linear';

toastr.options.closeButton = true;

function loadShipment(id) {
    $("#shipped-placeholder").slideUp("slow");
    $("#shipped").prepend(template(id));

    $(".unlaunch").on("click", closeShipper);
    $(".modal-background").on("click", closeShipper);

}

$("#launch").on("click", openShipper);
$("#time-travel").on("click", timeTravel);
$("#logged-in-user").on("click", triggerAccountMenu);

function triggerAccountMenu() {
    $("#account-menu").slideToggle(100);
}

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
    getSL(uid);
    $("#share-modal" + uid).addClass("is-active");
}

$.get("https://api.github.com/repos/mj66/shipit-frontend/commits", function (data, status) {
    $("#commit-id").html(data[0].sha);
    $("#commit-id").attr("href", data[0].html_url);
    $("#commit-id").attr("title", data[0].commit.message);
});

function toTop() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    return false;
}

function timeTravel() {
    $("body").fadeOut(200);

    setTimeout(function () {
        $('*').contents().filter(function () {
            return this.nodeType == Node.TEXT_NODE && this.nodeValue.trim() != '';
        }).each(function () {
            this.nodeValue = '🕒🕒🕒🕒';
        });
        $("body").fadeIn(200);


        $("body").fadeOut(2000);
    }, 500);

    setTimeout(function () {
        window.location.href = "https://github.com/hackclub/hackclub/blob/master/internals/logos/hack_to_the_future.svg";
    }, 2500);
}