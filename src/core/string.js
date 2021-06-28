if (!String.prototype.contains) {
    String.prototype.contains = function (str) {
        return this.indexOf(str) != -1;
    };
}