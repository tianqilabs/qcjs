var css = [
    "fa.css", "qcjs.css", "help.css"
];
var head = document.querySelector("body");
for (var i = 0; i < css.length; i++) {
    var el = document.createElement("link");
    el.type = "text/css";
    el.href = "../css/" + css[i];
    head.appendChild(el);
}