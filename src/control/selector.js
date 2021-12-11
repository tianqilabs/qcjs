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

        var title = contrl.attr("qc-title"),
            icon = contrl.attr("qc-icon");

        text.attr("title", title || "");
        qc.util.icon(caret, icon || "caret");

        var mode = contrl.attr("qc-mode") || "auto";
        contrl[0].mode = mode.contains("normal") ? "" : "auto";
        contrl[0].seMode = mode.contains("search") ? "search" : "";
        if (contrl[0].seMode) {
            text.attr("placeholder", title || "");
            text.removeAttr("readonly");

            text.change(function (ev) {
                return false;
            });
            text.keyup(function (ev) {
                qc.selector.show({"contrl": contrl, "curr": qc(this), "ev": ev});
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
            var opt = qc(this),
                texts = opt.text(),
                pass = true,
                b = {};

            b[field] = opt.attr("value");
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
    getData: function (contrl, callee) {
        var args = {};
        if (contrl[0].orEl) {
            qc.util.getVal(qc(contrl[0].orEl), args);
        }
        if (contrl[0].search) {
            args[contrl.attr("qc-search-key") || "search_key"] = contrl[0].search;
        }

        qc.selector.get(contrl.attr("qc-get"), contrl, args, callee);
    },
    get: function (url, contrl, args, callee) {
        contrl.find("ul").empty();
        if (url) {
            var _url = contrl.attr("qc-get");
            contrl.attr("qc-get", url);
            qc.util.get(contrl, args, function (d) {
                contrl.attr("qc-get", _url);
                contrl[0].data = d;
                qc.selector.fillData(contrl, callee);
            });
        } else {
            qc.selector.fillData(contrl, callee);
        }
    },
    fillData: function (contrl, callee) {
        var data = contrl[0].data;

        var field = contrl.attr("qc-field") || "v",
            texts = (contrl.attr("qc-text") || field).split(","),
            buttons = (contrl.attr("qc-buttons") || "").split(","),
            ul = contrl.find("ul");

        for (var i = 0; i < data.rows; i++) {
            var b = data.data[i],
                ts = [],
                btns = [];

            texts.each(function (tx) {
                tx = tx.trim();
                var v = b[tx];
                ts.push(v == undefined ? tx : v);
            });

            buttons.each(function (btn) {
                var ary = btn.split("|"),
                    name = ary[0], icon = ary[1], fn = ary[3], title = ary[2];

                if (ary.length == 1 && !name)
                    return true;

                var a = qc("<a href='javascript:void(0);' class='qc-button'>" + name + "</a>");
                if (icon) {
                    qc.util.icon(a, icon, "selector");
                }
                if (title) {
                    a.attr("title", title);
                }
                if (fn) {
                    a.attr("qc-fn", fn);
                }
                btns.push(a);
            });

            var text = ts.join(" ");
            var li = qc("<li>" + text + "</li>");
            li.attr("qc-value", b[field]);
            li.attr("qc-text", text);
            li.attr("qc-type", "select");
            if (btns.length > 0) {
                var bs = qc("<div class='qc-buttons'>");
                bs.append(btns);
                li.append(bs);
            }
            ul.append(li);
        }

        var def = contrl.attr("qc-default"),
            list = contrl.find("li"),
            curr = list.filter("[qc-value='" + def + "']");

        if (def == undefined) {
            curr = list.eq(0);
        }

        qc.selector.selected({"contrl": contrl, "curr": curr});
        if (callee)
            callee(contrl);
    },
    show: function (obj) {
        var contrl = obj.contrl,
            hided = contrl.find("ul").css("display") != "none" && !(obj.ev && obj.ev.type.toLowerCase() == "keyup");

        if (hided) {
            qc("body").click();
        } else {
            if (contrl[0].seMode) {
                qc.selector.search(obj, qc.selector.shown);
            } else {
                qc.selector.shown(contrl);
            }
        }
    },
    shown: function (contrl) {
        var ul = contrl.find("ul");
        ul.show();
        qc.util.hideObj.set(ul, contrl);
        ul.css({
            "left": "0px",
            "top": contrl.height() + "px",
            "min-width": contrl.width() + "px"
        });

        var seled = ul.find("li.selected");
        if (seled.length > 0)
            ul[0].scrollTop = seled[0].offsetTop;
    },
    select: function (obj) {
        qc.selector.selected(obj);

        var ul = obj.contrl.find("ul");
        qc.util.hideObj.hides.each(function (tars) {
            if (tars[0].equals(ul)) {
                ul.hide();
                qc.util.hideObj.hides.remove(tars);
            }
        });

        qc.selector.post(obj.contrl);
    },
    selected: function (obj) {
        var contrl = obj.contrl,
            curr = obj.curr,
            text = curr[0] ? curr.attr("qc-text") : "",
            value = curr[0] ? curr.attr("qc-value") : "";

        contrl.find("li").removeClass("selected");
        if (curr[0]) {
            curr.addClass("selected");
        }

        if (obj.ev || contrl[0].search == undefined)
            contrl.find("[qc-content]").val(text);

        contrl.attr("qc-value", value);
        qc.selector.for(contrl);
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
        qc.selector.for(contrl);
        var editor = contrl.closest("[qc-control='editor']");
        if (editor.length > 0) {
            qc.editor.change({"contrl": editor, "curr": contrl});
        }
    },
    for: function (contrl) {
        var fr = contrl.attr("qc-for");
        if (fr) {
            qc.selector.getData(qc(fr));
        }
    },
    search: function (obj) {
        var contrl = obj.contrl;
        contrl[0].search = obj.curr.val();
        qc.selector.getData(contrl, qc.selector.shown);
    },
    val: function (contrl, value) {
        if (value == undefined) {
            value = contrl.attr("qc-value");
        } else {
            if (!value && !contrl[0].search) {
                contrl[0].search = undefined;
            }
            var curr = contrl.find("li[qc-value='" + value + "']");
            qc.selector.selected({"contrl": contrl, "curr": curr});
        }
        return value;
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