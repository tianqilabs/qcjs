qc.c = {};
qc.icon = {};
qc.lang = {};
qc["util"] = qc.c.util = {
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
            if (typeof fn == "string")
                fnc = Function("return " + fn)();
            else if (typeof fn == "object" && fn.attr("qc-fn"))
                fnc = Function("return " + fn.attr("qc-fn"))();
            else if (typeof fn == "function")
                fnc = fn;
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
    getKeys: function (contrl, args) {
        args = args || {};

        qc.util.getFields(contrl, "qc-key qc-need", args);

        return args;
    },
    getFields: function (contrl, attr, args) {
        args = args || {};

        if (attr) {
            attr.split(" ").each(function (att) {
                att = att.trim();
                var _attr = contrl.attr(att);
                if (_attr) {
                    _attr.split(" ").each(function (_att) {
                        _att = _att.trime();
                        qc.util.getVal(contrl.find("[qc-field='" + _att + "']"), args);
                    });
                }
            });
        } else {
            contrl.find("[qc-field]").each(function () {
                qc.util.getVal(qc(this), args);
            });
        }

        var keys = [], _key = args["key"];
        if (_key) {
            keys.push(_key);
        }
        var key = contrl.attr("qc-key");
        if (key) {
            keys.push.apply(keys, key.split(" "));
        }
        args["key"] = keys.join(",")

        return args;
    },
    getVal: function (obj, args) {
        var tagName = obj[0].tagName.toLowerCase(),
            type = obj.attr("type") || tagName,
            vs = ["hidden", "text", "password", "select", "textarea"],
            cs = ["checkbox", "radio"],
            field = obj.attr("qc-field"), val = undefined;

        if (vs.contains(type)) {
            val = obj.val();
            obj.attr("qc-value", val);
        } else if (cs.contains(type)) {
            val = obj.is(":checked") ? obj.attr("qc-value") || obj.val() : obj.attr("qc-default");
        } else if (type == "file") {
            val = obj[0];
        } else {
            var subs = obj.find("[qc-subfield]");
            if (subs.length > 0) {
                var vals = [];
                subs.each(function () {
                    var sub = qc(this),
                        v = sub.attr("qc-value");
                    vals.push(encodeURI(encodeURI(v)));
                    // n = sub.attr("qc-subfield"),
                    // n = n.replace(/@/gi, "%40");
                    // n = n.replace(/,/gi, "%2C");
                    // v = v.replace(/@/gi, "%40");
                    // v = v.replace(/,/gi, "%2C");
                    // vals.push(n + "=" + v);
                });
                obj.attr("qc-value", vals.join("&"));
            }
            val = obj.attr("qc-value");
        }
        if (args && field && val != undefined) {
            var v = args[field];
            if (v) {
                if (Array.isArray(v)) {
                    v.push(val);
                } else {
                    args[field] = [v, val];
                }
            } else {
                args[field] = val;
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
        if (obj.length > 0) {
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
                    value.split("&").each(function (val) {
                        val = decodeURI(decodeURI(val));
                        obj.append("<span qc-subfield qc-value='" + val + "']>" + val + "</span>");
                    });
                }
            }
        }
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

        var curr = obj, url,
            contrl = curr.closest("[qc-control]"),
            editor = contrl.closest("[qc-control='editor']");

        if ((type == "qc-post" || type == "qc-upload") && editor.equals(curr)) {
            url = contrl.attr(type);
            qc.util.getFields(editor, "", args);
        } else {
            var _obj = editor.length == 0 ? contrl : editor;
            url = _obj.attr(type);
            qc.util.getKeys(_obj, args);
            qc.util.getVal(curr, args);
        }

        if (url) {
            var fnc = qc.util.convert2fnc(url),
                re = {"contrl": contrl, "curr": curr, "args": args};

            if (fnc) {
                fnc(re, function (d) {
                    qc.util.postBack(d, re, callee);
                });
            } else {
                qc._post(url, args, function (d) {
                    qc.util.postBack(d, re, callee);
                });
            }
        }
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
        if (!qc["iconStyle"]) {
            qc["iconStyle"] = "<i class='fa'>";
        }
    }
};

qc(function () {
    qc.util.init();
});