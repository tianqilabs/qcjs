qc.c.treeview = {
    control: "treeview",
    create: function (obj) {
        var mode = obj.attr("qc-mode") || "auto",
            callee = obj.attr("qc-fn");

        var fn = qc.util.convert2fnc(callee);
        obj[0].callback = fn;
        obj[0].mode = mode;

        var content = obj.find("[qc-content]"),
            pKey = content.attr("qc-pKey"),
            val = content.attr("qc-value"),
            args = {};

        content.hide();

        obj[0].pKey = pKey;
        obj[0].key = content.attr("qc-key");

        var coll = content.contents("[qc-collapse]");
        if (coll[0]) {
            var _icon = coll.attr("qc-collapse") || "collapse";
            qc.util.icon(coll, _icon, "treeview");
            // content[0].coll_icon = qc.icon.treeview[_icon] || _icon;
        }
        var exp = content.contents("[qc-expand]");
        if (exp[0]) {
            var _icon = exp.attr("qc-expand") || "expand";
            qc.util.icon(exp, _icon, "treeview");
            // content[0].exp_icon = qc.icon.treeview[_icon] || _icon;
        }
        var addNew = content.contents("[qc-addNew]");
        if (addNew[0]) {
            var _icon = addNew.attr("qc-addNew") || "addNew";
            qc.util.icon(addNew, _icon, "treeview");
            // content[0].add_icon = qc.icon.treeview[_icon] || _icon;
        }

        if (obj.attr("qc-get") && mode.contains("auto")) {
            args[pKey] = val;
            qc.treeview.get(obj, obj, args, fn);
        }
    },
    get: function (contrl, curr, args, callee) {
        qc.util.get(contrl, args, function (d, re) {
            if (re) {
                re.curr = curr;
            }
            qc.treeview.fill(d, re, callee);
        });
    },
    fill: function (d, re, callee) {
        var curr = re.curr,
            contrl = re.contrl,
            cont = contrl.contents("[qc-content]"),
            ul = qc("<ul>");

        curr.find("ul").remove();
        curr.append(ul);

        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i];

            var li = qc("<li>");
            qc.treeview.content(cont, li, b, contrl[0].key);

            ul.append(li);
        }

        if (re.contrl[0].mode.contains("edit")) {
            var li = qc("<li>");
            qc.treeview.content(cont, li);
            ul.append(li);
        }

        if (callee) {
            callee(d, re);
        }
    },
    content: function (cont, li, b, key) {
        var clone = cont.clone(),
            clsName = clone.attr("class");

        li.addClass(clsName || "");
        if (b) {
            qc.util.setDatas(clone, b);
            li.append(clone.contents());
            qc.treeview.caret(li, "expand", b[key]);

            li.contents("[qc-collapse], [qc-addNew]").hide();
            li.contents("[qc-expand]").show();

        } else {
            li.contents("[qc-expand], [qc-collapse]").hide();
            li.contents("[qc-addNew]").show();
        }

    },
    caret: function (li, type, val) {
        li.contents(".qc-treeview-caret").remove();

        var caret = qc("<a href='javascript:void(0);' class='qc-treeview-caret'>");
        caret.attr("qc-type", type);
        caret.attr("qc-value", val);
        qc.util.icon(caret, type, "treeview");

        li.prepend(caret);
    },
    expand: function (re) {
        var contrl = re.contrl,
            curr = re.curr,
            pKey = contrl[0].pKey,
            li = curr.closest("li"),
            val = curr.attr("qc-value"),
            callee = contrl[0].callback;

        qc.treeview.get(contrl, li, {pKey: val}, callee);
        qc.treeview.caret(li, "collapse", val);
    },
    collapse: function (re) {
        var curr = re.curr,
            val = curr.attr("qc-value"),
            li = curr.closest("li");

        li.contents("ul").remove();
        qc.treeview.caret(li, "expand", val);
    }
};