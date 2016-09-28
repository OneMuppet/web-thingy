console.log("in date");
debugger;
var el = document.currentScript.ownerDocument.getElementById("date");
var date = new Date();
el.innerHtml = date.toString();
document.body.innerHtml = "bbbb";