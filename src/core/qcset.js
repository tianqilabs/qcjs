(function () {
    function QCSet(cont) {
        return new QCSet.prototype.init(cont);
    }

    QCSet.prototype = {
        constructor: QCSet,
        qcset: "1"
    };

    QCSet.prototype.init = function (cont) {
        this.length = 0;
        var objs = [];
        if (typeof cont == "string") {
            cont.split(",").each(function (arr) {
                objs.push(arr.trim());
            });
        } else {
            objs = cont ? cont : [];
        }
        for (var i = 0; i < objs.length; i++) {
            this.add(objs[i]);
        }
        return this;
    };

    QCSet.prototype.init.prototype = QCSet.prototype;

    window.QCSet = QCSet;
})();

QCSet.prototype.indexOf = function (arg, index) {
    return qc._indexOf(this, arg, index);
};
QCSet.prototype.contains = function (arg) {
    return this.indexOf(arg) != -1;
};
QCSet.prototype.add = function () {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!this.contains(arg)) {
            this[this.length] = arg;
            this.length++;
        }
    }
    return this;
};
QCSet.prototype.remove = function () {
    var qcs = this, clone = [];
    this.each(function (s, i) {
        clone.push(s);
        delete qcs[i];
    });
    qcs.length = 0;
    for (var i = 0; i < arguments.length; i++) {
        var idx = clone.indexOf(arguments[i]);
        if (idx != -1) {
            clone.splice(idx, 1);
        }
    }
    clone.each(function (arr) {
        qcs.add(arr);
    });
    return qcs;
};
QCSet.prototype.each = function (callback) {
    qc._each(this, callback);
};
QCSet.prototype.merge = function (arg) {
    var obj = this;
    arg.each(function (s) {
        obj.add(s);
    });
    return this;
};
QCSet.prototype.join = function (split) {
    var data = [];
    this.each(function (s) {
        data.push(s)
    });
    return data.join(split);
};
QCSet.prototype.equals = function (obj) {
    return qc._equals(this, obj);
};
