toastr.options.showMethod = 'slideDown';
toastr.options.hideMethod = 'slideUp';
toastr.options.closeMethod = 'slideUp';
toastr.options.showEasing = 'swing';
toastr.options.hideEasing = 'linear';
toastr.options.closeEasing = 'linear';

toastr.options.closeButton = true;

$("#logged-in-user").on("click", triggerAccountMenu);

function triggerAccountMenu() {
    $("#account-menu").slideToggle(100);
}

window.onload = function() {
    console.log(firebase.auth().currentUser);
}

function closeShipper() {
    $(".modal").removeClass("is-active");
}

function finishShipper() {
    window.location = "../";
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
