(function() {
    console.log("in date");
    var el = document.currentScript.ownerDocument.getElementById("date");
    var date = new Date();
    el.innerHtml = date.toString();
    document.body.innerHtml = "bbbb";
})()