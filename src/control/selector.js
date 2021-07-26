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