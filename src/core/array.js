if (!Array.prototype.contains) {
    Array.prototype.contains = function (arg) {
        return this.indexOf(arg) != -1;
    };
}
if (!Array.prototype.each) {
    Array.prototype.each = function (callback) {
        qc._each(this, callback);
    };
}
if (!Array.prototype.equals) {
    Array.prototype.equals = function (arg) {
        return qc._equals(this, arg);
    };
}

if (!String.prototype.contains) {
    String.prototype.contains = function (str) {
        return this.indexOf(str) != -1;
    };
}
