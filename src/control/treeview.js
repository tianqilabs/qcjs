qc.c.treeview = {
    control: "treeview",
    create: function (obj) {
        var mode = obj.attr("qc-mode") || "auto";

        obj[0].mode = mode;

        var fn = obj.attr("qc-fn");
        if (fn) {
            obj[0].callback = qc.util.convert2fnc(fn);
        }

        var content = obj.find("[qc-content]");
        content.hide();

        obj[0].qc_pKey = content.attr("qc-pKey");
        obj[0].qc_key = content.attr("qc-key");
        obj[0].qc_val = content.attr("qc-value");

        if (obj.attr("qc-get") && mode.contains("auto")) {
            qc.treeview.get(obj);
        }
    },
    get: function (contrl, args, callee) {
        args = args || {};
        args[contrl[0].qc_pKey] = contrl[0].qc_val;
        qc.util.get(contrl, args, function (d, re) {
            qc.treeview.fill(d, re, callee);
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl,
            cont = contrl.contents("[qc-content]"),
            curr = contrl.find("[qc-key='" + contrl[0].qc_val + "']"),
            levels = parseInt(contrl.attr("qc-levels"));

        if (!curr[0])
            curr = contrl;

        var ul = curr.contents("ul").empty(),
            limit = false,
            li;

        if (!ul[0]) {
            ul = qc("<ul>");
            curr.append(ul);
        }


        if (!isNaN(levels) && levels > 0) {
            limit = ul.parents("ul").length + 1 == levels;
        }

        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i];

            li = qc("<li>");
            li[0].limit = limit;
            qc.treeview.content(cont, li, b);

            ul.append(li);
        }

        if (cont.contents("[qc-type='addNew']")[0]) {
            var pKey = curr.attr("qc-key") || "";
            li = qc("<li qc-pKey='" + pKey + "'>");
            qc.treeview.content(cont, li);
            ul.append(li);
        }

        var fn = callee || contrl[0].callback;
        if (fn && typeof fn == "function") {
            fn(d, re);
        }
    },
    content: function (cont, li, b) {
        var clone = cont.clone(),
            clsName = clone.attr("class"),
            field = cont.attr("qc-key"),
            pKey = cont.attr("qc-pKey");

        li.addClass(clsName || "");
        li.attr("qc-field", field);
        if (b) {
            li.attr("qc-key", b[field]);
            li.attr("qc-pKey", b[pKey]);
            li.append(clone.contents());
            qc.util.setDatas(li, b);
            qc.treeview.caretShow(li, "expand");

        } else {
            var addNew = clone.contents("[qc-type='addNew']");
            if (addNew[0]) {
                li.append(addNew);
                addNew.removeAttr("qc-type");
                addNew.show();
            }

        }

    },
    caretShow: function (li, name) {
        li.contents("[qc-type]").each(function () {
            var obj = qc(this),
                type = obj.attr("qc-type");

            if (name.contains(type)) {
                obj.show();
            } else {
                obj.hide();
            }
        });
    },
    expand: function (re) {
        var contrl = re.contrl,
            curr = re.curr,
            li = curr.closest("li");

        if (li[0].limit)
            return;

        contrl[0].qc_val = li.attr("qc-key");
        qc.treeview.get(contrl, {});
        qc.treeview.caretShow(li, "collapse");
    },
    setPKey: function (re) {
        var contrl = re.contrl,
            ul = re.curr.closest("ul"),
            li = ul.closest("li");

        contrl[0].qc_val = li[0] ? li.attr("qc-key") : contrl.find("[qc-content]").attr("qc-value");
    },
    collapse: function (re) {
        var curr = re.curr,
            li = curr.closest("li");

        if (li[0].limit)
            return;

        li.contents("ul").remove();
        qc.treeview.caretShow(li, "expand");

        var par = li.parent().closest("li");
        if (par[0]) {
            re.contrl[0].qc_val = par.attr("qc-key");
        } else {
            re.contrl[0].qc_val = re.contrl.find("[qc-content]").attr("qc-value");
        }
    },
    reload: function (re, callee) {
        var contrl = re.contrl,
            curr = re.curr,
            par = curr.parent().closest("li");

        if (par[0]) {
            contrl[0].qc_val = par.attr("qc-key");
        } else {
            contrl[0].qc_val = contrl.find("[qc-content]").attr("qc-value");
        }

        qc.treeview.get(contrl, {}, callee);
    }
};