/* ! qcjs (c) 老李 (20390965@qq.com) v0.2.0 */

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
qc.c.popfrm = {
    control: "popfrm",
    create: function (arg) {
        var obj = qc(arg);
        if (obj.length == 0) return;
        obj.hide();

        var warp = obj.find("[qc-warp]"),
            container = obj.find("[qc-container]"),
            content = obj.find("[qc-content]"),
            btns = obj.attr("qc-buttons"),
            title = obj.attr("qc-title"),
            contStr = obj.attr("qc-content");

        if (warp.length == 0) {
            warp = qc("<div class='qc-warp' qc-warp>");
            obj.prepend(warp);
        }
        if (container.length == 0) {
            container = qc("<div class='qc-container' qc-container>");
            obj.append(container);
        }
        if (btns || title) {
            qc.popfrm.createToolbar(title, btns, container);
        }
        if (content.length == 0) {
            content = qc("<div class='qc-content' qc-content>");
            container.append(content);
        }
        if (contStr) {
            content.html(contStr);
        }
        if (container.find("[qc-buttons] a").length == 0) {
            warp.attr("qc-type", "hide");
        }
    },
    show: function (obj) {
        var curr = obj.curr,
            popfrm = qc(curr.attr("qc-target")),
            callee = curr.attr("qc-fn");

        if (popfrm[0]) {
            popfrm[0].origin = curr;
            popfrm[0].isHide = true;

            popfrm.show();

            var callee = qc.util.convert2fnc(callee);
            if (callee)
                callee(popfrm);
            qc.popfrm.layout(popfrm);
        } else {
            var title = curr.attr("qc-title"),
                btn = curr.attr("qc-buttons"),
                cont = curr.contents(), content = curr.attr("qc-content") || "";

            var node = cont[0];
            while (node) {
                if (node.nodeType == 8) {
                    content += node.textContent + "\n";
                }
                node = node.nextSibling;
            }
            qc.popfrm.dyShow(title, btn, content, curr, callee);
        }
    },
    dyShow: function (title, btn, content, originObj, callee) {
        var popfrm = qc("<div class='qc-popfrm' qc-control='popfrm'>"),
            container = qc("<div class='qc-container' qc-container>"),
            warp = qc("<div class='qc-warp' qc-warp>");

        qc("body").append(popfrm);
        popfrm.append(warp).append(container);

        var btnLen = qc.popfrm.createToolbar(title, btn, container);
        if (btnLen == 0) {
            warp.attr("qc-type", "hide");
        }

        var cont = qc("<div class='qc-content' qc-content>");
        container.append(cont);

        if (typeof content == "object" && content.src) {
            popfrm[0].src = content.src;
            cont.addClass("qc-popfrm-iframe");
            cont.append("<iframe src='" + content.src + "'>");
        }
        if (typeof content == "string") {
            cont.append(content);
        }

        popfrm[0].origin = originObj;
        popfrm[0].isHide = false;
        popfrm.show();

        if (callee) {
            callee(popfrm);
        }
        qc.popfrm.layout(popfrm);
    },
    createToolbar: function (title, btn, container) {
        var toolbar  = container.find("[qc-toolbar]"), btnLen = 0;

        if (title || btn) {
            if (!toolbar[0]) {
                toolbar = qc("<div class='qc-toolbar' qc-toolbar>");
                container.prepend(toolbar);
            }

            var popTitle = toolbar.find("[qc-title]");
            if (!popTitle[0]) {
                popTitle = qc("<span class='qc-title' qc-title>");
                toolbar.append(popTitle);
            }
            if (!title) title = qc.lang.popfrm["title"];
            popTitle.html(title);

            btnLen = qc.popfrm.createButtons(btn, toolbar);
        }
        return btnLen;
    },
    createButtons: function (btn, toolbar) {
        if (!btn) return 0;

        var defBtn = {
            "cancel": {"title": qc.lang.popfrm["cancel"], "icon": "close", "text": "", "type": "hide"},
            "ok": {"title": qc.lang.popfrm["ok"], "icon": "ok"}
        }, btns = [], btnCancel = defBtn["cancel"], btnLen = 0;

        var _btn;
        if (typeof btn == "string") {
            _btn = btn.split(" ");
        } else {
            _btn = btn;
        }
        _btn.each(function (arr) {
            if (typeof arr == "string" && arr != "cancel")
                arr = defBtn[arr];
            if (typeof arr == "object") {
                var name = arr.name, _btn = defBtn[name];
                arr = qc._extend(arr, _btn);
                name == "cancel" ? btnCancel = arr : btns.push(arr);
            }
        });
        btns.push(btnCancel);

        btnLen = btns.length;
        if (btnLen > 0) {
            var buttons = toolbar.find("[qc-buttons]");
            if (!buttons[0]) {
                buttons = qc("<div class='qc-buttons' qc-buttons>");
                toolbar.append(buttons);
                buttons.empty();
            }
            btns.each(function (arr) {
                var a = qc("<a href='javascript:void(0);'>");
                buttons.append(a);

                a.attr("qc-type", arr.name == "cancel" && arr.fn ? "" : arr.type ? arr.type : "");
                qc.util.lang(a, arr.title, "title");
                if (arr.fn) {
                    a.attr("qc-fn", arr.fn);
                }
                if (arr.text) {
                    qc.util.lang(a, arr.text, "html");
                    a.prepend("&nbsp;")
                }
                if (arr.icon) {
                    qc.util.icon(a, arr.icon);
                }
                if (arr.title) {
                    a.attr("title", arr.title);
                }
            });

        }
        return btns.length;
    },
    hide: function (obj) {
        if (obj.contrl[0].isHide)
            obj.contrl.hide();
        else
            obj.contrl.remove();
    },
    layout: function (popfrm) {
        var originObj = popfrm[0].origin,
            docEl = popfrm[0].ownerDocument.documentElement,
            con = popfrm.find("[qc-container]"),
            warp = popfrm.find("[qc-warp]"),
            ifrm = popfrm.find(".qc-popfrm-iframe");

        var l, t, b, r, pos = "absolute";
        if (!originObj || popfrm[0].src) {
            t = "15%";
            l = "5%";
            r = "5%";
            b = "15%";
        } else {
            if (qc.util.mobile) {
                pos = "relative";
                t = warp.height() / 2 - con.height() /2 + "px";
            } else {
                if (originObj[0]) {
                    t = originObj.offset().top + originObj.height() - docEl.scrollTop;
                    l = originObj.offset().left;
                    if (t > warp.height() / 2)
                        t = t - con.height() - originObj.height();
                    if (l > warp.width() / 2)
                        l = l - con.width();
                    t += "px";
                    l += "px";
                }
            }
        }

        con.css({
            "position": pos,
            "top": t ? t : "auto",
            "left": l ? l : "auto",
            "right": r ? r : "auto",
            "bottom": b ? b : "auto",
        });

        if (ifrm[0]) {
            ifrm.css("height", "calc(100% - " + popfrm.find(".qc-toolbar").outerHeight() + "px");
        }
    }
};

qc.c.selector = {
    control: "selector",
    create: function (arg) {
        var obj = qc(arg);
        if (obj.length == 0) return;

        qc.selector.createBox(obj);
    },
    createBox: function (obj) {
        var contrl = qc("<div>");

        if (obj[0].getAttributeNames) {
            obj[0].getAttributeNames().each(function (attr) {
                contrl.attr(attr, obj.attr(attr));
            })
        } else {
            var attrs = obj[0].attributes;
            for (var i = 0; i < attrs.length; i++) {
                contrl.attr(attrs[i].name, attrs[i].value);
            }
        }

        obj.before(contrl);
        contrl.addClass("qc-selector");
        contrl.attr("qc-type", "show");

        qc.selector.initData(contrl, obj);

        var text = qc("<input type='text' class='qc-selector-text' qc-content readonly>"),
            caret = qc("<a href='javascript:void(0);' class='qc-selector-caret'></a>"),
            list = qc("<ul qc-selector-list>");
        contrl.append(caret).append(text).append(list);

        qc.util.icon(caret, "caret");

        var mode = contrl.attr("qc-mode") || "auto";
        contrl[0].mode = mode.contains("normal") ? "" : "auto";
        if (mode.contains("search")) {
            text.removeAttr("readonly");
            text.change(function (ev) {
                return false;
            });
            text.keyup(function (ev) {
                qc.selector.search({"contrl": contrl, "curr": qc(this), "ev": ev});
            });
        }

        text.attr("qc-type", "show");

        list.hide();
    },
    initData: function (contrl, obj) {
        var data = [],
            field = contrl.attr("qc-field") || "v",
            text = contrl.attr("qc-text") || field;

        obj.find("option").each(function () {
            var opt = qc(this);
            var b = {};
            b[field] = opt.attr("value");
            var texts = opt.text(), pass = true;
            texts.split(",").each(function (t) {
                t = t.trim();
                var m = /^([^=]+)=(.+)$/.exec(t);
                if (m) {
                    b[m[1]] = m[2];
                    pass = false;
                }
            });
            if (pass)
                b[text] = texts;
            data.push(b);
        });
        contrl[0].data = {"rows": data.length, "data": data};
        obj.remove();
    },
    getDatas: function (obj) {
        var frs, sels;
        if (obj) {
            frs = obj.filter("[qc-for]");
            sels = obj;
        } else {
            frs = qc("[qc-control='selector'][qc-for]");
            sels = qc("[qc-control='selector']");
        }
        frs.each(function () {
            var curr = qc(this), fr = qc(curr.attr("qc-for"));
            curr[0].frEl = fr[0];
            fr[0].orEl = curr[0];
        });

        sels.each(function () {
            if (!this.orEl && (obj || this.mode == "auto")) {
                var contrl = qc(this);
                qc.selector.getData(contrl);
            }
        });
    },
    getData: function (contrl) {
        var args = {};
        if (contrl[0].orEl) {
            qc.util.getVal(qc(contrl[0].orEl), args);
        }
        if (contrl[0].search) {
            args["search_key"] = contrl[0].search;
        }

        if (contrl.attr("qc-get")) {
            qc.util.get(contrl, args, function (d) {
                contrl[0].data = d;
                qc.selector.fillData(contrl);
            });
        } else {
            qc.selector.fillData(contrl);
        }
    },
    fillData: function (contrl) {
        var data = contrl[0].data;

        var field = contrl.attr("qc-field") || "v",
            text = contrl.attr("qc-text") || field,
            texts = text.split(" "),
            list = contrl.find("ul");

        list.empty();
        for (var i = 0; i < data.rows; i++) {
            var b = data.data[i], ts = [];
            texts.each(function (tx) {
                var v = b[tx];
                ts.push(v ==undefined ? tx : v);
            });

            var text = ts.join("");
            var li = qc("<li>" + text + "</li>");
            li.attr("qc-value", b[field]);
            li.attr("qc-text", text);
            li.attr("qc-type", "select");
            list.append(li);
        }

        var def = contrl.attr("qc-default"),
            list = contrl.find("li"),
            curr = def == undefined ? list.eq(0) : list.filter("[qc-value='" + def + "']");
        qc.selector.selected({"contrl": contrl, "curr": curr});
    },
    show: function (obj) {
        var ul = obj.contrl.find("ul"),
            mode = obj.contrl.attr("qc-mode"),
            search = obj.ev && obj.ev.type == "keyup",
            hided = ul.css("display") != "none";

        if (hided && !search) {
            qc("body").click();
        } else {
            ul.show();
            qc.util.hideObj.set(ul, obj.contrl);

            ul.css({
                "left": "0px",
                "top": obj.contrl.height() + "px",
                "min-width": obj.contrl.width() + "px"
            });

            var seled = ul.find("li.selected");
            if (seled.length > 0)
                ul[0].scrollTop = seled[0].offsetTop;
        }
    },
    select: function (obj) {
        var contrl, _obj;
        if (obj.contrl) {
            contrl = obj.contrl;
            _obj = obj;
        } else {
            contrl = obj;
            var def = contrl.attr("qc-default"),
                list = contrl.find("li"),
                curr = def == undefined ? list.eq(0) : list.filter("[qc-value='" + def + "']");
            _obj = {"contrl": contrl, "curr": curr};
        }
        qc.selector.selected(_obj);

        var ul = contrl.find("ul");
        qc.util.hideObj.hides.each(function (tars) {
            if (tars[0].equals(ul)) {
                ul.hide();
                qc.util.hideObj.hides.remove(tars);
            }
        });

        if (!contrl[0].search || obj.ev)
            qc.selector.post(contrl);
    },
    selected: function (obj) {
        var contrl = obj.contrl,
            curr = obj.curr,
            text = curr.length > 0 ? curr.attr("qc-text") : "",
            value = curr.length > 0 ? curr.attr("qc-value") : "";

        contrl.find("li").removeClass("selected");
        if (curr.length > 0) {
            curr.addClass("selected");
        }

        var cont = contrl.find("[qc-content]");
        if (obj.ev) {
            cont.val(text);
        } else {
            if (contrl[0].search == undefined)
                cont.val(text);
        }
        contrl.attr("qc-value", value);
    },
    post: function (contrl) {
        if (contrl.attr("qc-post")) {
            qc.util.post(contrl, function (d) {
                qc.selector.change(contrl);
            });
        } else {
            qc.selector.change(contrl);
        }
    },
    change: function (contrl) {
        var fr = contrl.attr("qc-for");
        if (fr) {
            qc.selector.getData(qc(fr));
        }
        var editor = contrl.closest("[qc-control='editor']");
        if (editor.length > 0) {
            qc.editor.change({"contrl": editor, "curr": contrl});
        }
    },
    search: function (obj) {
        var contrl = obj.contrl,
            curr = obj.curr,
            val = curr.val();

        contrl[0].search = val;
        qc.selector.getData(contrl);
        qc.selector.show(obj);
    },
    val: function (contrl, value) {
        if (value)
            contrl.find("li[qc-value='" + value + "']").click();
        else
            return contrl.attr("qc-value");
    },
    text: function (contrl) {
        return contrl.find("[qc-content]").val();
    },
    addItem: function (contrl, field, value) {
        if (typeof contrl == "string") {
            contrl = qc(contrl);
        }
        var d = contrl[0].data, data = d.data;
        if (Array.isArray(field)) {
            data = data.concat(field);
        } else {
            var b = {};
            b[contrl.attr("qc-field")] = field;
            b[contrl.attr("qc-text")] = value;
            data.push(b);
        }
        d.data = data;
        d.rows = data.length;
        qc.selector.getDatas(contrl);
    },
    removeItem: function (contrl, index) {
        var idxs = [];
        if (Array.isArray(index)) {
            idxs = idxs.concat(index);
        } else {
            idxs.push(index);
        }
        var d = contrl[0].data, data = d.data;
        idxs.each(function (idx) {
            data.splice(idx, 1);
        });
        d.rows = data.length;
    }
};

qc.util.addInited(function () {
    qc.selector.getDatas();
});
qc.c.colorpicker = {
    control: "colorpicker",
    show: function (obj) {
        var curr = obj.curr,
            mode = curr.attr("qc-colorpicker-mode"),
            cssName = curr.attr("qc-colorpicker-css") || "color",
            target = curr.attr("qc-target") ? qc(curr.attr("qc-target")) : curr,
            color = target.css(cssName);

        qc.colorpicker.dyShow(curr, color, mode, function (color) {
            target.css(cssName, color);
        });
    },
    dyShow: function (originObj, color, mode, callee) {
        qc.popfrm.dyShow(qc.lang.colorpicker["title"], [{
            "name": "ok",
            "fn": "qc.colorpicker.confirm"
        }], "", originObj, function (popfrm) {
            popfrm[0].callee = callee;
            popfrm.addClass("qc-colorpicker");

            var content = popfrm.find("[qc-content]");
            qc.colorpicker.createContent(content, color, mode, callee);
        });
    },
    createContent: function (content, color, mode, callee) {
        mode = mode || (qc.util.mobile ? "list" : "panel");
        if (mode == "panel") {
            qc.colorpicker.createPanel(content);
            qc.colorpicker.init(content, color);
        }
        if (mode == "list") {
            qc.colorpicker.createList(content, color);
        }
    },
    createPanel: function (content) {
        var html = "" +
            "<div class='qc-colorpicker-panel'>" +
            "   <canvas width='256' height='126'></canvas>" +
            "   <div class='qc-colorpicker-panel-pick'></div> " +
            "</div>" +
            "<div class='qc-colorpicker-bar'>" +
            "   <div class='qc-colorpicker-cur'></div>" +
            "   <canvas width='160' height='12' class='qc-colorpicker-color'></canvas>" +
            "   <div class='qc-colorpicker-bar-pick'></div> " +
            // "   <a class='qc-colorpicker-none' href='javascript:void(0);'> </a>" +
            "   <div style='width: 160px; height: 12px;' class='qc-colorpicker-a-back'></div>" +
            "   <canvas width='160' height='12' class='qc-colorpicker-a'></canvas>" +
            "   <div class='qc-colorpicker-bar-pick-a'></div> " +
            "</div>" +
            "<div class='qc-colorpicker-textbox'>" +
            "   <div><input type='text' class='qc-colorpicker-hex'></div>" +
            "   <div>HEX</div>" +
            "   <div>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "   <div>" +
            "       <div class='qc-colorpicker-rgb-text'>R</div>" +
            "       <div class='qc-colorpicker-rgb-text'>G</div>" +
            "       <div class='qc-colorpicker-rgb-text'>B</div>" +
            "       <div class='qc-colorpicker-rgb-text'>A</div>" +
            "</div>" +
            "</div>";
        content.css("padding", 0);
        content.append(html);

        content.find(".qc-colorpicker-panel")[0].onselectstart = function () {
            return false;
        };
        content.find(".qc-colorpicker-bar")[0].onselectstart = function () {
            return false;
        };
    },
    init: function (content, color) {
        qc.colorpicker.drawBar(content);

        color = !color || color == "transparent" ? "rgba(0,0,0,0)" : color;

        content[0].rgba = qc.colorpicker.str2rgba(color);

        var panel = content.find(".qc-colorpicker-panel");
        qc.colorpicker.event(panel, qc.colorpicker.setPanelPickP);

        var bar = content.find(".qc-colorpicker-bar");
        qc.colorpicker.event(bar, qc.colorpicker.setBarPickP);

        content.find(".qc-colorpicker-hex, .qc-colorpicker-rgb").change(function (ev) {
            if (qc(this).is(".qc-colorpicker-hex")) {
                content[0].rgba = qc.colorpicker.str2rgba(this.value);
            }
            if (qc(this).is(".qc-colorpicker-rgb")) {
                var rgba = [];
                content.find(".qc-colorpicker-rgb").each(function (i) {
                    var v = this.value.trim();
                    if (v.length == 0) v = 0;
                    rgba[i] = v;
                });
                content[0].rgba.r = rgba[0];
                content[0].rgba.g = rgba[1];
                content[0].rgba.b = rgba[2];
                content[0].rgba.a = rgba[3];
            }
            qc.colorpicker.setBarPick(content);
            qc.colorpicker.setPanelPick(content);
            qc.colorpicker.setTextBox(content);
        });

        qc.colorpicker.setBarPick(content);
        qc.colorpicker.setPanelPick(content);
        qc.colorpicker.setTextBox(content);
    },
    drawBar: function (content) {
        var colors = ["#f00", "#f0f", "#00f", "#0ff", "#0f0", "#ff0", "#f00"],
            cavs = content.find(".qc-colorpicker-color"),
            width = cavs.width(),
            height = cavs.height();

        var ctx = cavs[0].getContext("2d"),
            grad = ctx.createLinearGradient(1, 0, width - 1, 0),
            len = colors.length - 1;

        colors.each(function (color, i) {
            grad.addColorStop(i / len, color);
        });
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    },
    event: function (obj, fn) {
        obj.on("mousedown", function (ev) {
            var tar = qc(ev.target);
            if (tar.hasClass("qc-colorpicker-bar-pick") ||
                tar.hasClass("qc-colorpicker-bar-pick-a") ||
                tar.hasClass("qc-colorpicker-panel-pick") || tar.is("canvas")) {
                obj.tar = tar;
                fn(obj, ev.pageX, ev.pageY);

                qc(document).on("mousemove", mousemove, false);

                function mousemove(ev) {
                    fn(obj, ev.pageX, ev.pageY);
                    ev.preventDefault();
                }

                qc(document).on("mouseup mouseleave", mouseup, false);

                function mouseup(ev) {
                    qc(document).off("mousemove", mousemove, false);
                    qc(document).off("mouseup", mouseup, false);
                }
            }
        });
    },
    setPanelPickP: function (panel, pageX, pageY) {
        var pick = panel.find(".qc-colorpicker-panel-pick"),
            x = pageX - panel.offset().left,
            y = pageY - panel.offset().top,
            cavs = panel.find("canvas"),
            width = cavs[0].width,
            height = cavs[0].height,
            content = panel.closest("[qc-content]");

        x = Math.max(0, Math.min(x, width));
        y = Math.max(0, Math.min(y, height));

        var rgba = content[0].rgba;
        var bg = rgba.r >= 200 && rgba.g >= 200 && rgba.b >= 200 ? "#000" : "#fff";
        pick.css({
            "left": (x - pick.width() / 2) + "px",
            "top": (y - pick.height() / 2) + "px",
            "box-shadow": "0 0 2px 2px " + bg
        });

        var hsba = cavs[0].hsba;    // qc.colorpicker.rgba2hsba(cavs[0].hsba);console.log(hsba);
        hsba.s = x * 100 / width;
        hsba.b = 100 - y * 100 / height;
        hsba.a = rgba.a;
        content[0].rgba = qc.colorpicker.hsba2rgba(hsba);

        qc.colorpicker.setTextBox(content);
    },
    setBarPickP: function (bar, pageX, pageY) {
        var tar = bar.tar, isPickA = false, pick;
        if (tar.hasClass("qc-colorpicker-color") || tar.hasClass("qc-colorpicker-bar-pick")) {
            pick = bar.find(".qc-colorpicker-bar-pick");
        } else {
            pick = bar.find(".qc-colorpicker-bar-pick-a");
            isPickA = true;
        }

        var cavs = bar.find("canvas").eq(isPickA ? 1 : 0),
            x = pageX - bar.offset().left,
            width = cavs[0].width,
            content = bar.closest("[qc-content]");

        x = Math.max(cavs[0].offsetLeft, Math.min(x, width + cavs[0].offsetLeft));

        pick.css({
            "left": (x - pick.width() / 2) + "px"
        });

        if (isPickA) {
            var a = ((x - cavs[0].offsetLeft) / width).toFixed(2);
            if (a == 0) a = 0;
            if (a == 1) a = 1;
            content[0].rgba.a = a;
        } else {
            var hsba = qc.colorpicker.rgba2hsba(content[0].rgba);
            hsba.h = 360 - 360 * (x - cavs[0].offsetLeft) / width;
            // console.log(hsba, qc.colorpicker.hsba2rgba(hsba));
            content[0].rgba = qc.colorpicker.hsba2rgba(hsba);

            qc.colorpicker.drawPanel(content, hsba);
        }
        qc.colorpicker.setTextBox(content);
    },
    setBarPick: function (content) {
        var pick = content.find(".qc-colorpicker-bar-pick"),
            picka = content.find(".qc-colorpicker-bar-pick-a"),
            cavs = content.find(".qc-colorpicker-bar canvas"),
            width = cavs[0].width,
            offset = cavs[0].offsetLeft,
            hsba = qc.colorpicker.rgba2hsba(content[0].rgba),
            h = hsba.h,
            x = (360 - h) / 360 * width + offset - pick.width() / 2,
            xa = cavs[1].width / 255 * (hsba.a * 255) + offset - picka.width() / 2;

        qc.colorpicker.drawPanel(content, hsba);
        pick.css("left", x + "px");
        picka.css("left", xa + "px");
    },
    drawPanel: function (content, hsba) {
        var cavs = content.find(".qc-colorpicker-panel canvas"),
            ctx = cavs[0].getContext("2d"),
            width = cavs[0].width,
            height = cavs[0].height,
            color1 = "#fff";

        hsba.s = 100;
        hsba.b = 100;
        hsba.a = 1;

        var rgba = qc.colorpicker.hsba2rgba(hsba),
            color2 = qc.colorpicker.rgba2str(rgba);

        cavs[0].hsba = hsba;

        var grad1 = ctx.createLinearGradient(3, 0, width - 3, 0);
        grad1.addColorStop(0, color1);
        grad1.addColorStop(1, color2);
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        var grad2 = ctx.createLinearGradient(0, 3, 0, height - 3);
        grad2.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad2.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);

        var bara = content.find(".qc-colorpicker-a");
        var ctxa = bara[0].getContext("2d");
        ctxa.clearRect(0, 0, width, height);

        var grad3 = ctxa.createLinearGradient(1, 0, bara[0].width - 1, 0);
        var c1 = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", 0)",
            c2 = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", 1)";
        grad3.addColorStop(0, c1);
        grad3.addColorStop(1, c2);
        ctxa.fillStyle = grad3;
        ctxa.fillRect(0, 0, width, height);
    },
    setPanelPick: function (content) {
        var cavs = content.find(".qc-colorpicker-panel canvas"),
            pick = content.find(".qc-colorpicker-panel-pick"),
            width = cavs[0].width,
            height = cavs[0].height,
            rgba = content[0].rgba,
            hsba = qc.colorpicker.rgba2hsba(rgba);

        var x = parseInt(hsba.s * width / 100 - pick.width() / 2),
            y = parseInt((100 - hsba.b) * height / 100 - pick.height() / 2);

        pick.css({
            "left": x + "px",
            "top": y + "px",
            "box-shadow": "0 0 2px 2px " + (rgba.r >= 200 && rgba.g >= 200 && rgba.b >= 200 ? "#000" : "#fff")
        });
    },
    setTextBox: function (content) {
        var cur = content.find(".qc-colorpicker-cur"),
            hex = content.find(".qc-colorpicker-hex"),
            rgbs = content.find(".qc-colorpicker-rgb"),
            rgba = content[0].rgba;

        cur.css("background", qc.colorpicker.rgba2str(rgba));
        hex.val(qc.colorpicker.rgba2str(rgba, "hex"));
        var _rgba = [rgba.r, rgba.g, rgba.b];
        rgbs.each(function (i) {
            qc(this).val(_rgba[i]);
        });
        var a = 1;
        if (rgba.a == 0) a = 0;
        if (rgba.a == 1) a = 1;
        rgbs.eq(3).val(rgba.a );
    },
    str2rgba: function (str) {
        str = str.replace(/\s+/g, "");
        var rgba = {"r": 0, "g": 0, "b": 0, "a": 1},
            regs = [
                /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})?$/i,
                /^rgb\((\d{0,3}),(\d{0,3}),(\d{0,3})\)$/i,
                /^rgba\((\d{0,3}),(\d{0,3}),(\d{0,3}),([\d\.]+)\)$/i
            ];
        regs.each(function (reg, i) {
            var m = str.match(reg);
            if (m) {
                var rgb = [m[1], m[2], m[3]].map(function (x) {
                    return parseInt(i > 1 ? x : "0x" + (x.length == 1 ? x + x : x));
                });
                rgba.r = rgb[0];
                rgba.g = rgb[1];
                rgba.b = rgb[2];
                if (m[4]) {
                    rgba.a = i == 0 ?
                        parseFloat((parseInt("0x" + m[4]) / 255).toFixed(2)) : m[4];
                }
                return false;
            }
        });
        return rgba;
    },
    rgba2hsba: function (rgba) {
        var _r = rgba.r, _g = rgba.g, _b = rgba.b,
            h = 0, s = 0, b = 0;

        var min = Math.min(_r, _g, _b);
        var max = Math.max(_r, _g, _b);
        var delta = max - min;
        b = max;
        s = max != 0 ? 255 * delta / max : 0;

        if (s != 0) {
            if (_r == max) h = (_g - _b) / delta;
            else if (_g == max) h = 2 + (_b - _r) / delta;
            else h = 4 + (_r - _g) / delta;
        } else h = 0;
        h *= 60;
        if (h < 0) h += 360;
        s *= 100 / 255;
        b *= 100 / 255;
        return {"h": h, "s": s, "b": b, "a": rgba.a};
    },
    hsba2rgba: function (hsba) {
        var r, g, b;
        var h = Math.round(hsba.h);
        var s = Math.round(hsba.s * 255 / 100);
        var v = Math.round(hsba.b * 255 / 100);

        if (s == 0) {
            r = g = b = v;
        } else {
            var t1 = v;
            var t2 = (255 - s) * v / 255;
            var t3 = (t1 - t2) * (h % 60) / 60;

            if (h == 360) h = 0;

            if (h < 60) {
                r = t1;
                b = t2;
                g = t2 + t3
            } else if (h < 120) {
                g = t1;
                b = t2;
                r = t1 - t3
            } else if (h < 180) {
                g = t1;
                r = t2;
                b = t2 + t3
            } else if (h < 240) {
                b = t1;
                r = t2;
                g = t1 - t3
            } else if (h < 300) {
                b = t1;
                g = t2;
                r = t2 + t3
            } else if (h < 360) {
                r = t1;
                g = t2;
                b = t1 - t3
            } else {
                r = 0;
                g = 0;
                b = 0
            }
        }
        return {"r": Math.round(r), "g": Math.round(g), "b": Math.round(b), "a": hsba.a};
    },
    rgba2str: function (rgba, type) {
        var r = rgba.r, g = rgba.g, b = rgba.b, a = rgba.a;
        if (type == "hex") {
            var hex = "#" + [r, g, b].map(function (x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }).join("");
            if (a != 1) {
                hex += Math.round("0" + (a * 255)).toString(16).slice(-2);
            }
            return hex;
        } else {
            var rgb = [r, g, b].join(",");
            return a == 1 ? "rgb(" + rgb + ")" : "rgba(" + rgb + "," + a + ")";
        }
    },
    createList: function (content, origColor) {
        var rgb = qc.colorpicker.str2rgba(origColor);
        [
            ["#C00000", "#ff0000", "#FFC000", "#ffff00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"],
            ["#FFFFFF", "#000000", "#E7E6E6", "#44546A", "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5", "#70AD47"],
            ["#F2F2F2", "#7F7F7F", "#D0CECE", "#D5DCE4", "#D9E2F3", "#FBE4D5", "#EDEDED", "#FFF2CC", "#DEEAF6", "#E2EFD9"],
            ["#D9D9D9", "#595959", "#AEAAAA", "#ACB9CA", "#B4C6E7", "#F7CAAC", "#DBDBDB", "#FFE599", "#BDD6EE", "#C5E0B3"],
            ["#BFBFBF", "#404040", "#767171", "#8496B0", "#8EAADB", "#F4B083", "#C9C9C9", "#FFD966", "#9CC2E5", "#A8D08D"],
            ["#A6A6A6", "#262626", "#3B3838", "#323E4F", "#2F5496", "#C45911", "#7B7B7B", "#BF8F00", "#2E74B5", "#538135"],
            ["#808080", "#0D0D0D", "#171717", "#222A35", "#1F3864", "#833C0B", "#525252", "#806000", "#1F4E79", "#385623"]
        ].each(function (color, i) {
            var row = qc("<div class='qc-colorpicker-row'>");
            color.each(function (c, j) {
                var box = qc("<a href='javascript:void(0);' class='qc-colorpicker-box'>");
                box.css("background-color", c);
                var _rgb = qc.colorpicker.str2rgba(c);
                if (_rgb.r == rgb.r && _rgb.g == rgb.g && _rgb.b == rgb.b && rgb.a == 1) {
                    box.addClass("selected");
                }
                row.append(box);
                box.click(function () {
                    var obj = qc(this);
                    content.find(".qc-colorpicker-box").removeClass("selected");
                    obj.addClass("selected");
                });
            });
            content.append(row);
        });
    },
    item: function (obj) {
        var fnc = obj.curr.closest("[qc-content]")[0].callee;
        var bg = obj.curr.css("background-color");
        if (fnc && bg) {
            fnc(bg);
            qc.popfrm.dyHide(obj);
        }
    },
    confirm: function (obj) {
        var contrl = obj.contrl,
            origin = contrl[0].origin,
            fnc = contrl[0].callee,
            content = contrl.find("[qc-content]"),
            color;

        if (content[0].rgba) {
            color = qc.colorpicker.rgba2str(content[0].rgba);
        } else {
            color = content.find(".qc-colorpicker-box.selected").css("background-color");
        }

        if (fnc) {
            fnc(color);
        }
        qc.popfrm.hide(obj);
    }
};

qc.c.datepicker = {
    control: "datepicker",
    show: function (obj) {
        var curr = obj.curr,
            mode = curr.attr("qc-mode") || "date",
            target = curr.attr("qc-target") ? qc(curr.attr("qc-target")) : curr;

        qc.popfrm.dyShow(qc.lang.datepicker["title"], [
            {"name": "ok", "fn": "qc.datepicker.confirm"},
            {"name": "cancel", "fn": "qc.datepicker.hide"}
        ], "", curr, function (popfrm) {
            var today = new Date(),
                content = popfrm.find("[qc-content]");

            content.css("padding", 0);
            popfrm.addClass("qc-datepicker");

            var date = today,
                dateStr = curr.val();

            if (dateStr) {
                dateStr = dateStr.replace(/[-\.]/gi, "/");
                var dt = new Date(dateStr);
                if (!isNaN(dt.getTime()))
                    date = dt;
            }

            content[0].date = date;
            content[0].mode = mode;
            content[0].target = target;

            qc.datepicker.createContent(content);
            qc.datepicker.format(content);

            content[0].refresh = qc.datepicker.refresh;
            content[0].refresh(content);

        });
    },
    createContent: function (content) {
        var mode = content[0].mode;
        if (["date", "datetime"].contains(mode)) {
            var ymbar = qc("" +
                "<div class='qc-datepicker-bar'>" +
                "   <div class='qc-datepicker-ymbox'>" +
                "       <span years qc-fn='qc.datepicker.ymShow'></span>" +
                "   </div>" +
                "   <div class='qc-datepicker-buttons'>" +
                "       <span class='qc-datepicker-up' qc-fn='qc.datepicker.udpick'></span>" +
                "       <span class='qc-datepicker-down' qc-fn='qc.datepicker.udpick'></span>" +
                "   </div>" +
                "</div>");
            content.append(ymbar);

            qc.util.icon(ymbar.find(".qc-datepicker-up"), "up");
            qc.util.icon(ymbar.find(".qc-datepicker-down"), "down");

            var datebar = qc("<div class='qc-datepicker-bar'>" +
                "   <table class='qc-datepicker-dates'>" +
                "       <tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>");
            content.append(datebar);

            datebar.find("tr").eq(0).find("th").each(function (i) {
                var weeks = qc.lang.datepicker["weeks"];
                qc(this).html(weeks[i]);
            });

            datebar.find("td").attr("qc-fn", "qc.datepicker.datepick")
        }

        var timebar = qc("<div class='qc-datepicker-bar times'>");
        content.append(timebar);

        if (["datetime", "time"].contains(mode)) {
            var hms = qc("" +
                "   <span class='qc-datepicker-hour' qc-fn='qc.datepicker.hmsShow'></span> : " +
                "   <span class='qc-datepicker-minute' qc-fn='qc.datepicker.hmsShow'></span> : " +
                "   <span class='qc-datepicker-second' qc-fn='qc.datepicker.hmsShow'></span> " +
                "");
            timebar.append(hms);
        }

        if (["datetime", "date", "time"].contains(mode)) {
            var today = qc("" +
                (mode != "time" ?
                "   <span class='qc-datepicker-today' qc-fn='qc.datepicker.today'>" + qc.lang.datepicker["today"] + "</span>" : "") +
                "   <span class='qc-datepicker-cancel' qc-fn='qc.datepicker.cancel'>" + qc.lang.datepicker["cancel"] + "</span>" +
                "");
            timebar.append(today);
        }

        if (["date", "datetime"].contains(mode)) {
            var ympicker = qc("" +
                "<div class='qc-datepicker-ympicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>"
            );
            timebar.before(ympicker);
            ympicker.find("td").attr("qc-fn", "qc.datepicker.ympick");
        }

        if (["datetime", "time"].contains(mode)) {
            var hpicker = qc("" +
                "<div class='qc-datepicker-hpicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>");
            var mspicker = qc("" +
                "<div class='qc-datepicker-mspicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>" +
                "");
            if (mode == "time")
                timebar.after(hpicker).after(mspicker);
            else
                timebar.before(hpicker).before(mspicker);

            hpicker.find("td").each(function (i) {
                qc(this).attr("qc-fn", "qc.datepicker.hmspick").attr("v", i).html(i);
            });

            mspicker.find("td").each(function (i) {
                qc(this).attr("qc-fn", "qc.datepicker.hmspick").attr("v", i).html(i);
            });
        }

    },
    format: function (content) {
        qc.datepicker.formatym(content);
        qc.datepicker.formatDates(content);
        qc.datepicker.formatTimes(content);
        qc.datepicker.layout(content, 0);
    },
    formatym: function (content) {
        var mode = content[0].mode;
        if (!["date", "datetime"].contains(mode))
            return;

        var dt = content[0].date,
            year = dt.getFullYear(),
            month = dt.getMonth();

        var years = qc.lang.datepicker["years"];
        var months = qc.lang.datepicker["months"];

        var ny = years.split("/").map(function (y) {
            if (y.contains("m")) {
                return "<span month='" + month + "' qc-fn='qc.datepicker.ymShow'>" + y.replace(/m/, months[month]) + "</span>";
            } else if (y.contains("y")) {
                return "<span year='" + year + "' qc-fn='qc.datepicker.ymShow'>" + y.replace(/y/, year) + "</span>";
            }
        }).join("");

        var ymbox = content.find(".qc-datepicker-ymbox");
        ymbox.find("[year], [month]").remove();
        ymbox.append(ny);

        ymbox.find("[years]").hide();
        ymbox.find("[year]").show();
        ymbox.find("[month]").show();
    },
    formatDates: function (content) {
        var mode = content[0].mode;
        if (!["date", "datetime"].contains(mode))
            return;

        var dt = content[0].date,
            year = dt.getFullYear(),
            month = dt.getMonth();

        var dte = new Date(year, month + 1, 1);
        dte.setDate(dte.getDate() - 1);
        var datee = dte.getDate();

        var dates = 1;
        var dts = new Date(year, month, dates);
        var days = dts.getDay();
        if (days == 0) days = 7;

        var dtb = new Date(year, month, 1);
        dtb.setDate(dtb.getDate() - 1);
        var dateb = dtb.getDate();

        var tb = content.find(".qc-datepicker-dates");
        tb.find("td").removeClass("other");
        var tr = tb.find("tr");
        var rows = 1;

        // befor month;
        if (days > 1) {
            var dayb = days - 2;
            var y = year, m = month;
            m = m - 1;
            if (m == -1) {
                y--;
                m = 11;
            }
            while (rows == 1) {
                var td = tr.eq(rows).find("td").eq(dayb);
                td.attr("year", y).attr("month", m).attr("date", dateb);
                td.addClass("other").html(dateb);
                dayb--;
                dateb--;
                if (dayb < 0) {
                    break;
                }
            }
        }

        // curr month;
        while (dates <= datee) {
            var td = tr.eq(rows).find("td").eq(days - 1);
            td.attr("year", year).attr("month", month).attr("date", dates);
            td.html(dates);
            days++;
            dates++;
            if (days > 7) {
                rows++;
                days = 1;
            }
        }

        // next month;
        dates = 1, y = year, m = month;
        m = m + 1;
        if (m == 12) {
            y++;
            m = 0;
        }
        while (rows < 7) {
            var td = tr.eq(rows).find("td").eq(days - 1);
            td.attr("year", y).attr("month", m).attr("date", dates);
            td.addClass("other").html(dates);
            days++;
            dates++;
            if (days > 7) {
                rows++;
                days = 1;
            }
        }

        qc.datepicker.date(content);
    },
    formatTimes: function (content) {
        var mode = content[0].mode;
        if (!["time", "datetime"].contains(mode))
            return;

        var dt = content[0].date;
        var hour = dt.getHours();
        var minute = dt.getMinutes();
        var second = dt.getSeconds();

        var h = ("0" + hour).slice(-2);
        var m = ("0" + minute).slice(-2);
        var s = ("0" + second).slice(-2);

        content.find(".qc-datepicker-hour").attr("hour", h).html(h);
        content.find(".qc-datepicker-minute").attr("minute", m).html(m);
        content.find(".qc-datepicker-second").attr("second", s).html(s);
    },
    date: function (content) {
        var dt = content[0].date, now = new Date(),
            year = dt.getFullYear(),
            month = dt.getMonth(),
            date = dt.getDate();

        var tb = content.find(".qc-datepicker-dates");
        tb.find("td.picked, td.today").removeClass("picked today");

        var picked = tb.find("td[year='" + year + "'][month='" + month + "'][date='" + date + "']");
        picked.addClass("picked");

        var today = tb.find("td[year='" + now.getFullYear() + "'][month='" + now.getMonth() + "']" +
            "[date='" + now.getDate() + "']");
        if (today.length > 0) {
            today.addClass("today");
        }
        // day.addClass("picked");
        // if (year == now.getFullYear() && month == now.getMonth() && date == now.getDate())
        //     day.addClass("today");

    },
    refresh: function (content) {
        var refresh = content[0].refresh;
        if (!refresh) return;

        var now = new Date(),
            dt = content[0].date;

        if (dt == undefined) return;

        dt.setHours(now.getHours());
        dt.setMinutes(now.getMinutes());
        dt.setSeconds(now.getSeconds());
        content[0].date = dt;
        qc.datepicker.formatTimes(content);
        qc.datepicker.date(content);

        setTimeout(function () {
            refresh(content)
        }, 1000);
    },
    ymShow: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            ymbox = content.find(".qc-datepicker-ymbox"),
            ympicker = content.find(".qc-datepicker-ympicker");

        var spanys = ymbox.find("[years]"),
            spany = ymbox.find("[year]"),
            spanm = ymbox.find("[month]");

        if (ympicker.isShow()) {
            ympicker.hide();
            qc.datepicker.layout(content, 0);
            qc.datepicker.formatym(content);
            return;
        }

        var year = curr.attr("year"), month = curr.attr("month");

        spanm.hide();
        if (year) {
            spany.hide();
            spanys.show();
            qc.datepicker.yShow(year, spanys, ympicker);
        } else if (month) {
            spanys.hide();
            spany.show();
            qc.datepicker.mShow(month, ympicker);
        }

        qc.datepicker.layout(content, 1);
        ympicker.show();
    },
    yShow: function (year, spanys, ympicker) {
        var s0 = parseInt(year.slice(0, -1) + "0"),
            s = s0 - 3, e = s0 + 9;

        spanys.html(s0 + "-" + e).attr("s0", s0);

        ympicker.find("td").each(function () {
            var td = qc(this).removeClass("picked other");
            td.removeAttr("month").html(s);
            td.attr("year", s);
            if (s < s0 || s > s0 + 9) {
                td.addClass("other");
            }

            if (s == parseInt(year))
                td.addClass("picked");
            s++;
        });
    },
    mShow: function (month, ympicker) {
        var s = 0, e = 16;
        ympicker.find("td").each(function () {
            var td = qc(this).removeClass("picked other");
            td.removeAttr("year");
            td.attr("month", s);
            if (s > 11) {
                td.addClass("other");
                td.html(s + 1 - 12);
            } else
                td.html(s + 1);

            if (s == parseInt(month))
                td.addClass("picked");
            s++;
        });
    },
    ympick: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            ympicker = content.find(".qc-datepicker-ympicker");

        var year = curr.attr("year"), month = curr.attr("month"),
            dt = content[0].date;

        if (year) {
            dt.setFullYear(year);
        } else if (month) {
            dt.setFullYear(content.find(".qc-datepicker-ymbox [year]").attr("year"));
            dt.setMonth(month);
        }
        content[0].date = dt;
        qc.datepicker.format(content);
        ympicker.hide();
    },
    datepick: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            year = curr.attr("year"),
            month = curr.attr("month"),
            date = curr.attr("date");

        var dt = content[0].date;
        dt.setFullYear(year);
        dt.setMonth(month);
        dt.setDate(date);
        content[0].date = dt;
        qc.datepicker.date(content);
    },
    udpick: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]"),
            ymbox = content.find(".qc-datepicker-ymbox"),
            ympicker = content.find(".qc-datepicker-ympicker"),
            spanys = ymbox.find("[years]"),
            spany = ymbox.find("[year]"), spanm = ymbox.find("[month]"), up = 0;

        if (curr.is(".qc-datepicker-up"))
            up = -1;
        if (curr.is(".qc-datepicker-down"))
            up = 1;
        if (ympicker.isShow()) {
            if (spanys.isShow()) {
                var s0 = parseInt(spanys.attr("s0")) + up * 10;
                qc.datepicker.yShow(s0 + "", spanys, ympicker);
            } else {
                var s0 = parseInt(spany.attr("year")) + up;
                spany.attr("year", s0);
                spany.html(spany.html().replace(/\d+/gi, s0));
            }
        } else {
            var mstr = "", ystr = "";
            qc.lang.datepicker["years"].split("/").each(function (arr) {
                if (arr.contains("m")) {
                    mstr = arr;
                } else if (arr.contains("y")) {
                    ystr = arr;
                }
            });

            var s0 = parseInt(spanm.attr("month")) + up;
            var dt = content[0].date;
            dt.setMonth(s0);
            content[0].date = dt;

            var y = dt.getFullYear(), m = dt.getMonth();
            spanm.attr("month", m);
            spanm.html(mstr.replace(/m/, qc.lang.datepicker["months"][m]));
            spany.attr("year", y);
            spany.html(ystr.replace(/y/, y));

            qc.datepicker.formatDates(content);
        }
    },
    today: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]");

        content[0].date = new Date();
        qc.datepicker.format(content);
        if (!content[0].refresh) {
            content[0].refresh = qc.datepicker.refresh;
            content[0].refresh(content);
        }
    },
    cancel: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]");

        content[0].date = undefined;
        qc.datepicker.confirm(obj);
    },
    hmsShow: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]"),
            dt = content[0].date;

        var hour = curr.attr("hour"),
            minute = curr.attr("minute"),
            second = curr.attr("second"),
            picker = hour ? "hour" : minute ? "minute" : second ? "second" : "";

        var hpicker = content.find(".qc-datepicker-hpicker"),
            mspicker = content.find(".qc-datepicker-mspicker");

        var obj = picker == "hour" ? hpicker : mspicker;

        if (obj.isShow() && obj.attr("picker") == picker) {
            obj.removeAttr("picker");
            obj.hide();
            qc.datepicker.layout(content, 0);
            return;
        }

        hpicker.hide();
        mspicker.hide();

        if (picker == "hour") {
            value = dt.getHours();
        } else if (picker == "minute") {
            value = dt.getMinutes();
        } else if (picker == "second") {
            value = dt.getSeconds();
        }

        if (value != undefined) {
            obj.find("td.picked").removeClass("picked");
            obj.find("td[v='" + value + "']").addClass("picked");
            obj.attr("picker", picker).show();

            qc.datepicker.layout(content, picker);
        }
    },
    hmspick: function (obj) {
        var curr = obj.curr,
            value = curr.attr("v"),
            picker = curr.closest("[picker]"),
            pickerName = picker.attr("picker"),
            content = picker.closest("[qc-content]");

        var dt = content[0].date;
        if (pickerName == "hour") {
            dt.setHours(value);
        } else if (pickerName == "minute") {
            dt.setMinutes(value);
        } else if (pickerName == "second") {
            dt.setSeconds(value);
        }
        content[0].date = dt;
        content[0].refresh = undefined;
        qc.datepicker.formatTimes(content);

        picker.removeAttr("picker");
        picker.hide();
        qc.datepicker.layout(content, 0);
    },
    confirm: function (obj) {
        var contrl = obj.contrl,
            content = contrl.find("[qc-content]"),
            tar = content[0].target;

        var date = qc.datepicker.formatDate(content[0].date, content[0].mode);
        if (tar[0].value != undefined) {
            tar.val(date);
        } else {
            tar.html(date);
        }
        tar.change();
        qc.datepicker.hide(obj);
    },
    formatDate: function (dt, mode) {
        if (!dt) return "";

        var y = dt.getFullYear(),
            M = ("0" + (dt.getMonth() + 1)).slice(-2),
            d = ("0" + dt.getDate()).slice(-2),
            h = ("0" + dt.getHours()).slice(-2),
            m = ("0" + dt.getMinutes()).slice(-2),
            s = ("0" + dt.getSeconds()).slice(-2);

        if (mode == "datetime") {
            return y + "-" + M + "-" + d + " " + h + ":" + m + ":" + s;
        } else if (mode == "time") {
            return h + ":" + m + ":" + s;
        }
        return y + "-" + M + "-" + d;
    },
    layout: function (content, type) {
        var bars = content.find(".qc-datepicker-bar"),
            times = content.find(".qc-datepicker-bar times"),
            years, dates, times, ympicker, hpicker, mspicker;

        if (bars.length == 1) {
            times = bars.eq(0);
            mspicker = times.next();
            hpicker = mspicker.next();
        } else {
            years = bars.eq(0);
            dates = bars.eq(1);
            times = bars.eq(2);
            ympicker = bars.eq(1).next();
            hpicker = ympicker.next();
            mspicker = hpicker.next();
        }

        times.find("[hour], [minute], [second]").removeClass("selected");

        if (type == 0) {
            hpicker.hide();
            mspicker.hide();

            if (years) {
                bars.show();
                ympicker.hide();

                var datetb = dates.contents("table");

                ympicker.find("table").width(datetb.width());
                ympicker.find("table").height(datetb.height());

                hpicker.find("table").width(datetb.width());
                hpicker.find("table").height(years.height() + dates.height());

                mspicker.find("table").width(datetb.width());
                mspicker.find("table").height(years.height() + dates.height());
            }
        } else if (type == 1) {
            hpicker.hide();
            mspicker.hide();
            times.hide();

            if (years) {
                years.show();
                dates.hide();
                ympicker.show();
            }

        } else if (type == "hour" || "minute" || "second") {
            times.show();
            mspicker.hide();

            if (years) {
                years.hide();
                dates.hide();
                ympicker.hide();
            }

            if (type == "hour") {
                hpicker.show();
                mspicker.hide();
            } else {
                hpicker.hide();
                mspicker.show();
            }

            times.find("[" + type + "]").addClass("selected");

            qc.popfrm.layout(content.closest("[qc-control]"));
        }

    },
    hide: function (obj) {
        obj.contrl.find("[qc-content]")[0].refresh = undefined;
        qc.popfrm.hide(obj);
    }
};
qc.c.lister = {
    control: "lister",
    create: function (obj) {
        var conts = obj.find("[qc-content]");
        conts.hide();

        obj.find("[qc-toolbar]").remove();
        qc.lister.createBar(obj);

        if (!obj.find("ul")[0]) {
            obj.append("<ul>");
        }

        var page = obj.attr("qc-page"), count = obj.attr("qc-count");
        if (!page) {
            obj.attr("qc-page", 1);
        }
        if (!count) {
            obj.attr("qc-count", 20);
        }
    },
    createBar: function (contrl) {
        var btns = contrl.attr("qc-buttons");
        if (btns) {
            var toolbar = qc("<div class='qc-toolbar' qc-toolbar></div>");
            contrl.prepend(toolbar);

            btns.split(" ").each(function (btn) {
                var m = btn.split("|");
                var a = qc("<a href='javascript:void(0);' qc-type='view'></a>");
                toolbar.append(a);
                if (m[1]) {
                    var attr = m.length > 2 ? m.slice(2) : [];
                    qc.util.lang(a, m[1], attr.join(","));
                    a.prepend("&nbsp;");
                }
                if (m[0]) {
                    qc.util.icon(a, m[0]);
                }
            });
        }
    },
    getDatas: function () {
        qc("[qc-control='lister']").each(function () {
            qc.lister.setView(qc(this), 0);
            qc.lister.get(qc(this));
        });
    },
    get: function (contrl, args, callee) {
        args = args || {};
        args.page = contrl.attr("qc-page");
        args.count = contrl.attr("qc-count");
        qc.util.get(contrl, args, function (d, re) {
            re.contrl[0].data = d;
            qc.lister.fill(d, re, callee);
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl,
            conts = contrl.find("[qc-content]"),
            btns = contrl.find("[qc-toolbar] a.selected"), cont;

        if (!conts[0])
            return ;

        cont = conts.eq(btns[0] ? btns.index() : 0);
        if (btns[0]) {
            cont = conts.eq(btns.index());
        }


        var ul = contrl.find("ul");
        ul.empty();

        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i];

            var li = qc("<li>");
            qc.lister.content(cont, li, b);

            ul.append(li);
        }

        var pn = contrl.attr("qc-for");
        if (pn) {
            qc.pagepicker.show(qc(pn), contrl, d.pages);
        }

        if (callee) callee(d, re);
    },
    content: function (cont, li, b) {
        var clone = cont.clone(),
            clsName = clone.attr("class");

        li.addClass(clsName || "");
        for (var k in b) {
            var _obj = clone.find("[qc-field='" + k + "']");
            if (_obj[0])
                _obj.attr("qc-value", b[k]).html(b[k]);
        }
        li.append(clone.contents());
    },
    setView: function (contrl, index) {
        index = index || 0;

        var btns = contrl.find("[qc-toolbar] a");
        btns.removeClass("selected");
        btns.eq(index).addClass("selected");
    },
    view: function (obj) {
        var curr = obj.curr,
            contrl = obj.contrl,
            index = curr.index();

        qc.lister.setView(contrl, index);
        obj.args = {};
        qc.lister.fill(contrl[0].data, obj);
    },
    item: function (obj) {
        var contrl = obj.contrl;
        qc.util.post(contrl, args, function (d, re) {
            qc.lister.showMsg(obj.curr, re);
        });
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
        qc.util.hideObj.set(s, obj);
    }
};

qc.util.addInited(function () {
    qc.lister.getDatas();
});

qc.c.pagepicker = {
    control: "pagepicker",
    create: function (obj) {
        obj.hide();
        obj.addClass("qc-pagepicker");
    },
    show: function (contrl, origin, pages) {
        contrl[0].origin = origin;
        contrl.empty();

        var _page = origin.attr("qc-page") || 1,
            _count = origin.attr("qc-count") || 20,
            _pc = contrl.attr("qc-count") || 10;

        var page = parseInt(_page);
        var count = parseInt(_count);
        var pc = parseInt(_pc);

        var p = Math.floor((page - 1) / pc) * pc + 1;

        if (page > pc) {
            qc.pagepicker.setPage(contrl, p - 1, "&lt;", page);
        }

        for (var i = 0; i < pc; i++) {
            if (p > pages)
                break;
            qc.pagepicker.setPage(contrl, p, p, page);
            p++;
        }

        if (p < pages) {
            qc.pagepicker.setPage(contrl, p, "&gt;", page);
        }
        contrl.show();
    },
    setPage: function (contrl, value, text, currPage) {
        var li = qc("<li qc-type='page'>");
        li.attr("qc-value", value).html(text);
        if (currPage == value) {
            li.addClass("selected");
        }
        contrl.append(li);
    },
    page: function ( obj) {
        var tar = qc(obj.contrl[0].origin),
            contrln = tar.attr("qc-control"),
            _obj = qc[contrln];

        tar.attr("qc-page", obj.curr.attr("qc-value"));
        _obj.get(tar);
    }
};
qc.c.editor = {
    control: "editor",
    create: function (obj) {
        obj[0].edit = "auto";
        obj[0].pos = "static";
        var mode = obj.attr("qc-mode");
        if (mode) {
            if (mode.contains("normal"))
                obj[0].edit = "";
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
        qc.util.get(contrl, args, function (d, re) {
            qc.editor.fill(d, re, callee)
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl;
        qc.editor.hideMsg(contrl);
        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i];
            qc.util.setDatas(contrl, b);
        }
        if (callee) callee(d, re);
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
            if (contrl[0].edit == "auto" || isContrl) {
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
                _re = false, match;

            rules.each(function (_rule) {
                if (_rule == "number") {
                    _re = /^-?\d+(\.\d+)?$/.exec(val);
                } else if (_rule == "date") {
                    try {
                        var dt = new Date(val);
                        _re = !isNaN(dt.getTime());
                    } catch (e) {

                    }
                } else if (_rule == "notnull") {
                    _re = val.length > 0;
                } else if (match = /^maxlen\((\d+)\)$/.exec(_rule)) {
                    _re = val.length <= match[1];
                } else if (match = /^format\(([^\)]+)\)$/.exec(_rule)) {
                    var reg = new RegExp(match[1], "gi");
                    _re = reg.exec(val);
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