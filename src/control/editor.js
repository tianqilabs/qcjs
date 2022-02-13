qc.c.editor = {
    control: "editor",
    create: function (obj) {
        obj[0].mode = QCSet();
        obj[0].pos = "static";

        var mode = obj.attr("qc-mode") || "auto";
        if (mode) {
            if (mode.contains("auto")) {
                obj[0].mode.add("get", "post");
            } else {
                if (mode.contains("get")) {
                    obj[0].mode.add("get");
                }
                if (mode.contains("post")) {
                    obj[0].mode.add("post");
                }
            }
            if (mode.contains("fixed")) {
                obj[0].pos = "fixed";
                obj.css("position", "absolute");
                obj.hide();
            }
        }
        obj.find("[qc-field]").each(function () {
            var _obj = qc(this),
                mode = _obj.attr("qc-mode");
            if (mode) {
                _obj.bind(mode, function () {
                    qc.editor.verify(qc(this));
                });
            }
        });
        qc.editor.hideMsg(obj);

        var fn = obj.attr("qc-fn");
        if (fn) {
            obj[0].callback = qc.util.convert2fnc(fn);
        }

        if (obj[0].mode.contains("get")) {
            qc.editor.get(obj, {});
        }
    },
    show: function (obj) {
        var contrl = qc(obj.curr.attr("qc-target")), args = {};
        contrl[0].orEl = obj.curr[0];
        qc.util.getVal(obj.curr, args);
        qc.editor.get(contrl, args);

        if (contrl[0].pos == "fixed") {
            contrl.show();
            qc.util.hideObj.set(contrl);
        }
    },
    get: function (contrl, args, callee) {
        args = args || {};
        qc.util.get(contrl, args, function (d, re) {
            qc.editor.fill(d, re, callee)
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl;
        qc.editor.hideMsg(contrl);

        if (d.rows == 0) {
            qc.util.initData(contrl);
        } else {
            for (var i = 0; i < d.rows; i++) {
                var b = d.data[i];
                qc.util.setDatas(contrl, b);
            }
        }

        var fn = callee || contrl[0].callback;
        if (fn && typeof fn == "function") {
            fn(d, re);
        }
    },
    change: function (obj, callee) {
        var contrl = obj.contrl,
            curr = obj.curr, re = true, isContrl = contrl.equals(curr);

        if (isContrl) {
            contrl.find("[qc-field]").each(function () {
                var that = qc(this);
                re = qc.editor.verify(that) && re;
            });
        } else {
            re = qc.editor.verify(curr);
        }

        if (re) {
            if (contrl[0].mode.contains("post") || isContrl) {
                qc.editor.post(curr, {}, callee);
            }
        }
    },
    submit: function (obj, callee) {
        obj.curr = obj.contrl;
        qc.editor.change(obj, callee);
    },
    post: function (contrl, args, callee) {
        qc.util.post(contrl, args, function (d, re) {
            qc.editor.fill(d, re, callee);
        });
    },
    verify: function (obj) {
        var objs = [];
        if (obj["contrl"]) {
            obj.contrl.find("[qc-field]").each(function () {
                objs.push(qc(this));
            });
        } else {
            objs.push(obj);
        }

        var re = true;
        objs.each(function (_obj) {
            var rule = _obj.attr("qc-rule");
            if (!rule) return true;

            var rules = rule ? rule.split(" ") : [],
                val = qc.util.getVal(_obj),
                _re = true, match;

            rules.each(function (_rule) {
                if (_rule == "number") {
                    _re = _re && /^-?[1-9]?\d*(\.\d{0,2})?$/.exec(val);
                } else if (_rule == "date") {
                    try {
                        var dt = new Date(val);
                        _re = _re && !isNaN(dt.getTime());
                    } catch (e) {

                    }
                } else if (_rule == "notnull") {
                    _re = _re && val.length > 0;
                } else if (match = /^maxlen\((\d+)\)$/.exec(_rule)) {
                    var k = 0;
                    for (var i = 0; i < val.length; i++) {
                        var code = val.charCodeAt(i);
                        if (code >= 0 && code <= 128) {
                            k++;
                        } else {
                            k += 2;
                        }
                    }
                    _re = _re && k <= match[1];
                } else if (match = /^format\(([^\)]+)\)$/.exec(_rule)) {
                    var reg = new RegExp(match[1], "gi");
                    _re = _re && reg.exec(val);
                }
            });

            qc.editor.showMsg(_obj, _re);
            re = re && _re;
        });

        return re;
    },
    showMsg: function (obj, re) {
        var s = qc(obj.attr("qc-success")), f = qc(obj.attr("qc-failure"));
        s.hide();
        f.hide();
        if (re) {
            s.show();
        } else {
            f.show();
        }
    },
    hideMsg: function (obj) {
        if (obj.is("[qc-control]")) {
            obj.find("[qc-field]").each(function () {
                qc(qc(this).attr("qc-success")).hide();
                qc(qc(this).attr("qc-failure")).hide();
            });
        } else {
            qc(obj.attr("qc-success")).hide();
            qc(obj.attr("qc-failure")).hide();
        }
    }
};