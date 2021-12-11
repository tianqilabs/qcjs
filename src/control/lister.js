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

        var fn = obj.attr("qc-fn");
        if (fn) {
            obj[0].callback = qc.util.convert2fnc(fn);
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

            btns.split(",").each(function (btn) {
                var m = btn.split("|");
                var a = qc("<a href='javascript:void(0);' qc-type='view'></a>");
                toolbar.append(a);
                if (m[1]) {
                    var attr = m.length > 2 ? m.slice(2) : [];
                    qc.util.lang(a, m[1], attr.join(","));
                    a.prepend("&nbsp;");
                    a.attr("qc-type", ["view", "list"].contains(m[1]) ? "view" : m[1]);
                }
                if (m[0]) {
                    qc.util.icon(a, m[0]);
                }
            });
        }
    },
    getDatas: function () {
        qc("[qc-control='lister']").each(function () {
            var obj = qc(this),
                mode = obj.attr("qc-mode") || "auto";

            qc.lister.setView(obj, 0);
            if (mode == "auto")
                qc.lister.get(obj);
        });
    },
    get: function (contrl, args, callee) {
        args = args || {};
        args.page = contrl.attr("qc-page") || 1;
        args.count = contrl.attr("qc-count") || 20;
        qc.util.get(contrl, args, function (d, re) {
            re.contrl[0].data = d;
            qc.lister.fill(d, re, callee);
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl,
            field = contrl.attr("qc-field"),
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
            qc.lister.content(cont, field, li, b);

            ul.append(li);
        }

        var pn = contrl.attr("qc-for");
        if (pn) {
            qc.pagepicker.show(qc(pn), contrl, d.pages);
        }

        var fn = callee || contrl[0].callback;
        if (fn && typeof fn == "function") {
            fn(d, re);
        }
    },
    content: function (cont, field, li, b) {
        var clone = cont.clone(),
            clsName = clone.attr("class");

        li.addClass(clsName || "");
        li.attr("qc-field", field);
        li.attr("qc-value", b[field]);
        for (var k in b) {
            var _obj = clone.find("[qc-field='" + k + "']");
            if (_obj[0]) {
                if (_obj[0].value != undefined)
                    _obj.val(b[k]);
                else
                    _obj.attr("qc-value", b[k]).html(b[k]);
            }
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
    }
};

qc.util.addInited(function () {
    qc.lister.getDatas();
});
