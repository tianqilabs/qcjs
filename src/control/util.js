qc.c = {};
qc.icon = {};
qc.lang = {};
qc["util"] = {
    mobile: false,
    _starts: [],
    _initeds: [],
    init: function () {
        if (arguments.length == 0) {
            qc.util.on();
            var cs = [];
            for (var cn in qc.c) {
                var c = qc.c[cn];
                qc[cn] = c;
                cs.push(c);
            }

            qc.util.iconInit();
            qc.util.starts();

            qc.util.langInit(function () {
                cs.each(function (c) {
                    if (c.create) {
                        if (c.control) {
                            qc("[qc-control='" + c.control + "']").each(function () {
                                c.create(qc(this));
                            });
                        } else {
                            c.create();
                        }
                    }
                });

                qc.util.initeds();
            });


        } else {
            for (var i = 0; i < arguments.length; i++) {
                var obj = qc(arguments[i]);
                var c = qc.util.convert2fnc("qc." + obj.attr("qc-control") + ".create");
                if (c)
                    c(obj);
            }
        }
    },
    convert2fnc: function (fn) {
        var fnc;
        try {
            if (typeof fn == "string") {
                if (fn.match(/^[\w\d_\$\.]+$/)) {
                    fnc = Function("return (" + fn + ")")();
                }
                // Function("return (" + fn + ")")();
            } else if (typeof fn == "object" && fn.attr("qc-fn")) {
                fnc = qc.util.convert2fnc(fn.attr("qc-fn"));
                // fnc = Function("return (" + fn.attr("qc-fn") + ")")();
            } else if (typeof fn == "function") {
                fnc = fn;
            }
        } catch (e) {

        }
        return fnc;
    },
    fnc: function (obj) {
        var re = true,
            fn = typeof obj == "string" ? obj : obj.fn,
            fnc = qc.util.convert2fnc(fn), reObj;

        if (typeof obj == "object") {
            reObj = {"contrl": obj.contrl, "curr": obj.curr, "ev": obj.ev};
        } else {
            reObj = obj;
        }

        if (fnc) {
            re = fnc(reObj);
        }
        return re;
    },
    on: function () {
        qc.util.isMobile();
        var doc = qc(document);
        doc.on("click", qc.util.event);
        doc.on("change", qc.util.event);
        qc(window).on("resize", qc.util.resize);
        qc(window).on("load", qc.util.resize);
    },
    addStart: function (fn) {
        if (fn && typeof fn == "function") {
            qc.util._starts.push(fn);
        }
    },
    addInited: function (fn) {
        if (fn && typeof fn == "function") {
            qc.util._initeds.push(fn);
        }
    },
    starts: function () {
        qc.util._starts.each(function (fn) {
            fn();
        });
    },
    initeds: function () {
        qc.util._initeds.each(function (arr, idx) {
            arr();
        });
    },
    event: function (ev) {
        var re = true;

        if (ev.type == "change") {
            qc.util.getVal(qc(ev.target));
        }

        var obj = qc.util.find(qc(ev.target), ev);
        if (obj.fn) {
            re = qc.util.fnc(obj);
        }

        qc.util.hideObj.remove(ev);
        return re;
    },
    find: function (obj, ev) {
        var contrl = obj.closest("[qc-control]"),
            curr = obj,
            fn = curr.attr("qc-fn"),
            fr = curr.attr("qc-for"),
            evType = ev.type.toLowerCase(),
            _qcType = curr.attr("qc-type"), qcType = QCSet();

        if (evType == "change")
            qcType.add(evType);

        if (_qcType) {
            _qcType = _qcType.trim();
            qcType.add(_qcType.split(/\s+/));
        }

        if (fr && evType != "change") {
            fn = "qc." + fr + ".show";
        } else {
            while (qcType.length == 0 && !fn) {
                curr = curr.parent();
                if (curr.length == 0) break;
                if (curr.attr("qc-type"))
                    qcType.add(curr.attr("qc-type"));
                fn = curr.attr("qc-fn");
            }

            if (qcType.length > 0 && fn) {
                fn = qcType.contains(evType) ? fn : "";
            } else if (contrl.length > 0 && qcType.length > 0 && !fn) {
                var type = qcType[0];
                if (type != "change" || (type == "change" && evType == type)) {
                    fn = "qc." + contrl.attr("qc-control") + "." + qcType[0];
                }
            }
        }

        return {"contrl": contrl, "curr": curr, "fn": fn, "ev": ev};
    },
    hideObj: {
        hides: QCSet(),
        set: function () {
            var tar = [];
            for (var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                tar.push(arg);
            }
            qc.util.hideObj.hides.add(tar);
        },
        remove: function (ev) {
            qc.util.hideObj.hides.each(function (tars) {
                var re = false;
                tars.each(function (tar) {
                    var obj = qc(tar);
                    re = re || (ev.pageX >= obj.offset().left && ev.pageX <= obj.offset().left + obj.width()
                        && ev.pageY >= obj.offset().top && ev.pageY <= obj.offset().top + obj.height());
                });
                if (!re) {
                    qc(tars[0]).hide();
                    qc.util.hideObj.hides.remove(tars);
                }
            });
        }
    },
    resize: function () {
        qc.util.isMobile();
    },
    isMobile: function () {
        var mobile = false;
        if ("maxTouchPoints" in navigator) {
            mobile = navigator.maxTouchPoints > 0;
        } else if ("msMaxTouchPoints" in navigator) {
            mobile = navigator.msMaxTouchPoints > 0;
        } else {
            var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
            if (mQ && mQ.media === "(pointer:coarse)") {
                mobile = !!mQ.matches;
            } else if ('orientation' in window) {
                mobile = true; // deprecated, but good fallback
            } else {
                // Only as a last resort, fall back to user agent sniffing
                var UA = navigator.userAgent;
                mobile = (
                    /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
                    /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
                );
            }
        }
        qc.util.mobile = mobile;
    },
    getFields: function (contrl, attr, args) {
        args = args || {};

        if (attr) {
            attr.split(",").each(function (att) {
                att = att.trim();
                var _attr = contrl.attr(att);
                if (_attr) {
                    _attr.split(",").each(function (_att) {
                        _att = _att.trim();
                        qc.util.getVal(contrl.find("[qc-field='" + _att + "']"), args);
                    });
                }
            });
        } else {
            contrl.find("[qc-field]").each(function () {
                qc.util.getVal(qc(this), args);
            });
        }

        var keys = QCSet(args["key"]);

        var key = contrl.attr("qc-key");
        if (key) {
            keys.add(key.split(","));
        }
        args["key"] = keys.join(",");

        return args;
    },
    getVal: function (obj, args) {
        var val = undefined;
        if (obj[0]) {
            var tagName = obj[0].tagName.toLowerCase(),
                type = obj.attr("type") || tagName,
                vs = ["hidden", "text", "password", "select", "textarea"],
                cs = ["checkbox", "radio"],
                field = obj.attr("qc-field"),
                ctrl = qc[obj.attr("qc-control")];

            if (vs.contains(type)) {
                val = obj.val();
                obj.attr("qc-value", val);

            } else if (cs.contains(type)) {
                val = obj.is(":checked") ? obj.attr("qc-value") || obj.val() : obj.attr("qc-default");

            } else if (type == "file") {
                val = obj[0];

            } else if (ctrl && ctrl.val) {
                val = ctrl.val(obj);

            } else {
                var subs = obj.find("[qc-subfield]");
                if (subs[0]) {
                    var vals = [];
                    subs.each(function () {
                        var sub = qc(this),
                            v = sub.attr("qc-value");
                        vals.push(v);
                    });
                    obj.attr("qc-value", vals.join("&"));
                }
                val = obj.attr("qc-value");
            }

            if (args && field && val != undefined) {
                var v = args[field];
                if (v) {
                    if (Array.isArray(v) && !v.contains(val)) {
                        v.push(val);
                    } else {
                        if (val && v != val)
                            args[field] = [v, val];
                    }
                } else {
                    args[field] = val;
                }
            }
        }
        return val;
    },
    setDatas: function (contrl, b) {
        for (var k in b) {
            qc.util.setData(contrl, k, b[k]);
        }
    },
    setData: function (contrl, name, value) {
        var obj = contrl.find("[qc-field='" + name + "']");
        if (obj[0]) {
            obj.attr("qc-value", value);

            if (obj.is("[qc-control='selector']")) {
                qc.selector.val(obj, value);

            } else if (obj.is("[type='checkbox']") || obj.is("[type='radio']")) {
                var def = obj.attr("qc-default");
                if (value == def) {
                    obj.attr("checked", "checked");
                } else {
                    obj.removeAttr("checked");
                }
            } else {
                var type = obj.attr("type");
                if (type) {
                    if (["hidden", "text", "password", "select", "textarea"].contains(type)) {
                        obj.val(value);
                    }

                } else {
                    var vs = value.split("&");
                    vs.each(function (val) {
                        val = decodeURI(decodeURI(val));
                        if (vs.length == 1) {
                            obj.html(val);
                        } else {
                            obj.append("<span qc-subfield qc-value='" + val + "'>" + val + "</span>");
                        }
                    });
                }
            }
        }
    },
    setDefualt: function (contrl, name, value) {
        var b = {};
        if (typeof name == "object") {
            b = name;
        } else {
            b[name] = value;
        }
        for (var k in b) {
            var obj = contrl.find("[qc-field='" + k + "']");
            if (obj[0]) {
                obj.attr("qc-default", b[k]);
                obj.removeAttr("qc-value");
                if (obj[0].value) {
                    obj.val("");
                } else {
                    obj.html("");
                }
            }
        }
    },
    initData: function (contrl, b) {
        contrl.find("[qc-field]").each(function () {
            var def = qc(this).attr("qc-default"),
                field = qc(this).attr("qc-field");

            if (def != undefined) {
                qc.util.setData(contrl, field, def);
            }
        });
    },
    get: function (obj, args, callee) {
        qc.util.postData("qc-get", obj, args, callee);
    },
    post: function (obj, args, callee) {
        qc.util.postData("qc-post", obj, args, callee);
    },
    upload: function (obj, args, callee) {
        qc.util.postData("qc-upload", obj, args, callee);
    },
    postData: function (type, obj, args, callee) {
        if (typeof args == "function") {
            callee = args;
            args = {};
        }

        var re = qc.util.parseArgs(type, obj, args),
            fn = re.fn;

        if (!fn)
            return;

        if (typeof fn == "string") {
            qc._post(fn, args, function (d) {
                qc.util.postBack(d, re.re, callee);
            });

        } else {
            fn(re.re, function (d) {
                qc.util.postBack(d, re.re, callee);
            });
        }
    },
    parseArgs: function (type, obj, args) {
        var fn,
            re;

        if (typeof obj == "string") {
            fn = qc.util.convert2fnc(obj) || obj;

        } else {
            var attrs = "qc-key, qc-need",
                curr = obj,
                contrl = curr.closest("[qc-control]"),
                parent = contrl.parent().closest("[qc-control]");

            if (parent[0]) {
                qc.util.getFields(parent, attrs, args);
            }
            if (contrl[0]) {
                qc.util.getFields(contrl, attrs, args);
            }
            qc.util.getVal(curr, args);

            if (curr.attr(type)) {
                fn = curr.attr(type);
            } else if (contrl[0] && contrl.attr(type)) {
                fn = contrl.attr(type);
            } else if (parent[0] && parent.attr(type)) {
                fn = parent.attr(type);
            }

            var _fn = qc.util.convert2fnc(fn);
            fn = _fn || fn;

            re = {"contrl": contrl, "curr": curr, "args": args};
        }

        return {"fn": fn, "re": re};
    },
    postBack: function (d, re, callee) {
        try {
            d = JSON.parse(d);
        } catch (e) {

        }
        if (callee) callee(d, re);
    },
    setLangDir: function (url) {
        qc.util._langDir = url;
    },
    getLangDir: function () {
        return qc.util._langDir;
    },
    setLangGlobal: function (name) {
        if (name)
            qc.util._langGlobal = name;
    },
    getLangGlobal: function () {
        return qc.util._langGlobal;
    },
    setLangName: function (name) {
        qc.util._langName = name;
    },
    getLangName: function () {
        return qc.util._langName;
    },
    langGlobal: function (callee) {
        if (!qc.util._langGlobal) {
            qc.util._langGlobal = qc("html").attr("qc-lang-global");
        }
        if (qc.util._langGlobal) {
            var global = qc.util._langGlobal;
            if (!global.match(/.*\.js$/)) {
                global += ".js";
            }
            var url = qc.util._langDir + "/" + global;
            qc.getScript(url, callee);
        } else {
            callee();
        }
    },
    langInit: function (name, callee) {
        if (typeof name == "function") {
            callee = name;
            name = undefined;
        }
        if (!qc.util._langDir) {
            qc.util._langDir = qc("html").attr("qc-lang-dir") ? qc("html").attr("qc-lang-dir") : "lang";
        }

        if (name) {
            qc.util._langName = name;
        }

        if (!qc.util._langName) {
            qc.util._langName = qc("html").attr("lang");
        }

        qc.util.langGlobal(function () {
            if (qc.util._langName) {
                var langName = qc.util._langName;
                if (!langName.match(/.*\.js$/)) {
                    langName += ".js";
                }
                var url = qc.util._langDir + "/" + langName;
                qc.getScript(url, function () {
                    qc.util.langReset();
                    if (callee)
                        callee();
                });
            } else {
                callee();
            }
        });
    },
    lang: function (obj, name, attr, controlName) {
        if (!attr) {
            attr = "title";
        }
        if (!controlName) {
            var _contrl = obj.closest("[qc-control]");
            if (_contrl[0])
                controlName = _contrl.attr("qc-control");
        }
        var contrl = qc.lang[controlName];
        if (contrl) {
            var lang = contrl[name] || name;
            if (lang) {
                attr.split(",").each(function (arr) {
                    arr = arr.trim();
                    if (arr == "html") {
                        obj.html(lang);
                    } else {
                        obj.attr(arr, lang);
                    }
                });
            }
        }
    },
    langReset: function () {
        qc("[qc-lang]").each(function () {
            var el = qc(this),
                lang = el.attr("qc-lang"),
                name = el.attr("qc-lang-name"),
                attr = el.attr("qc-lang-attr");
            qc.util.lang(el, name, attr, lang);
        });
    },
    icon: function (obj, name, controlName) {
        if (!controlName) {
            var _contrl = obj.closest("[qc-control]");
            if (_contrl[0])
                controlName = _contrl.attr("qc-control");
        }
        var contrl = qc.icon[controlName];
        if (contrl) {
            var css = contrl[name] || name;
            if (css) {
                if (qc.iconStyle) {
                    obj.prepend(qc(qc.iconStyle).addClass(css));
                } else {
                    obj.addClass(css);
                }
            }
        }
    },
    setIconStyle: function (cont) {
        qc.iconStyle = cont;
    },
    iconInit: function () {
        if (qc["iconStyle"] == undefined) {
            qc["iconStyle"] = "<i class='fa'>";
        }
    }
};

qc(function () {
    qc.util.init();
});