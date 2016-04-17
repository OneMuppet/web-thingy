"use strict"

window.onload = function () {
    var r = router();
    r.setup();
    if (!location.hash) {
        location.hash = "#/what";
    }
}