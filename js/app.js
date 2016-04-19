"use strict"

window.onload = function () {
    if (!location.hash) {
        location.hash = "#/posts";
    }
    var r = router();
    r.setup();
}