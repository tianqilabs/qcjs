qc.c.sheet = {
    control: "sheet",
    create: function (obj) {
        var mode = obj.attr("qc-mode") || "auto",
            getUrl = obj.attr("qc-get"),
            table = obj.contents("table");

        var fn = obj.attr("qc-fn");
        if (fn) {
            obj[0].callback = qc.util.convert2fnc(fn);
        }

        if (!table[0]) {
            table = qc("<table>");
            obj.append(table);
        }

        if (!table.contents("thead")[0]) {
            table.append("<thead>");
        }
        if (!table.contents("tbody")[0]) {
            table.append("<tbody>");
        }

        var cont = qc("<div qc-content>");
        obj.append(cont);
        cont.css("height", obj.height() + "px");
        obj.css("height", "auto");

        qc.sheet.foot(obj);

        var warp = qc("<div qc-warp>");
        warp.append(table);
        cont.append(warp);

        warp.on("scroll", qc.sheet.scroll);

        if (getUrl && mode == "auto") {
            qc.sheet.get(obj, {});
        } else {
            qc.sheet.format(table);
            qc.sheet.layout(obj);
            qc.sheet.pages(1, obj);
        }
    },
    foot: function (contrl) {
        var foot = qc("<div class='qc-sheet-foot' qc-foot>");
        contrl.append(foot);

        var first = qc("<span class='qc-sheet-page' qc-type='page' v='first'>");
        qc.util.icon(first, "first", "sheet");
        qc.util.lang(first, "first", "title", "sheet");
        foot.append(first);

        var left = qc("<span class='qc-sheet-page' qc-type='page' v='left'>");
        qc.util.icon(left, "left", "sheet");
        qc.util.lang(left, "left", "title", "sheet");
        foot.append(left);

        var inpt = qc("<input type='text' class='' v='page'>");
        qc.util.lang(inpt, "page", "title", "sheet");
        foot.append(inpt);
        inpt[0].contrl = contrl;
        inpt.keyup(qc.sheet.keyup);

        foot.append("<span>/</span><span v='pages'></span>");


        var right = qc("<span class='qc-sheet-page' qc-type='page' v='right'>");
        qc.util.icon(right, "right", "sheet");
        qc.util.lang(right, "right", "title", "sheet");
        foot.append(right);

        var last = qc("<span class='qc-sheet-page' qc-type='page' v='last'>");
        qc.util.icon(last, "last", "sheet");
        qc.util.lang(last, "last", "title", "sheet");
        foot.append(last);


    },
    fromat: function (table) {
        var ths = [];
        table.find("thead th").each(function () {
            ths.push(qc(this).attr("qc-fixed") == undefined ? "" : "qc-fixed");
        });
        table.find("tbody tr").each(function () {
            qc(this).find("td").each(function (idx) {
                if (ths[idx]) {
                    qc(this).attr("qc-fixed", "");
                }
            });
        });
    },
    get: function (contrl, args, callee) {
        contrl.find(".qc-sheet-head-y, .qc-sheet-data-x, .qc-sheet-head-x").remove();

        args = args || {};
        args.page = contrl.attr("qc-page") || 1;
        args.count = contrl.attr("qc-count") || 20;
        qc.util.get(contrl, args, function (d, re) {
            qc.sheet.fill(d, re, callee);
            qc.sheet.pages(d.pages, contrl);
            qc.sheet.layout(re.contrl);
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl,
            tb = contrl.find("[qc-content] table"),
            ths = tb.find("thead th");

        var tbody = tb.find("tbody").empty();
        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i],
                tr = qc("<tr>");

            tbody.append(tr);
            qc.sheet.fill_tr(tr, ths, b);
        }

        var fn = callee || contrl[0].callback;
        if (fn) {
            fn(d, re);
        }
    },
    fill_tr: function (tr, ths, b) {
        for (var i = 0; i < ths.length; i++) {
            var th = ths[i],
                field = qc(th).attr("qc-field"),
                fixed = qc(th).attr("qc-fixed") == undefined ? "" : "qc-fixed";

            tr.append("<td qc-field='" + field + "' qc-value='" + b[field] + "' " + fixed + ">" + b[field] + "</td>");
        }
    },
    layout: function (contrl) {
        var cont = contrl.find("[qc-content]"),
            warp = cont.find("[qc-warp]"),
            tb = warp.find("table"),
            thead_y = qc("<div class='qc-sheet-head-y'>"),
            data_x = qc("<div class='qc-sheet-data-x'>"),
            thead_x = qc("<div class='qc-sheet-head-x'>");

        cont.append(thead_y.append(tb.clone()));
        cont.append(data_x.append(tb.clone()));
        cont.append(thead_x.append(tb.clone()));

        warp[0].thead_y = thead_y;
        warp[0].data_x = data_x;
        warp[0].thead_x = thead_x;
    },
    scroll: function (ev) {
        if (this.st != this.scrollTop) {
            this.st = this.scrollTop;
            this.data_x[0].scrollTop = this.st;
        } else {
            this.sl = this.scrollLeft;
            this.thead_y[0].scrollLeft = this.sl;
        }
    },
    pages: function (pages, contrl) {
        var page = parseInt(contrl.attr("qc-page")) || 1,
            foot = contrl.find("[qc-foot]");

        foot.find(".qc-sheet-page").show();
        foot.find("[v='page']").val(page);
        foot.find("[v='pages']").html(pages);
        if (page == 1) {
            foot.find("[v='first']").hide();
            foot.find("[v='left']").hide();
        }
        if (page == 2) {
            foot.find("[v='left']").hide();
        }
        if (page == pages) {
            foot.find("[v='last']").hide();
            foot.find("[v='right']").hide();
        }
        if (page == pages - 1) {
            foot.find("[v='right']").hide();
        }
    },
    page: function (re) {
        var curr = re.curr,
            contrl = re.contrl,
            v = curr.attr("v"),
            foot = curr.parent(),
            p = parseInt(foot.find("[v='page']").val()),
            ps = parseInt(foot.find("[v='pages']").html());

        if (v == "left") {
            contrl.attr("qc-page", p - 1);
        } else if (v == "right") {
            contrl.attr("qc-page", p + 1);
        } else if (v == "first") {
            contrl.attr("qc-page", 1);
        } else if (v == "last") {
            contrl.attr("qc-page", ps);
        } else {
            if (p > ps)
                p = ps;
            curr.val(p);
            contrl.attr("qc-page", p);
        }
        qc.sheet.get(contrl, {}, contrl[0].callee);
    },
    keyup: function (ev) {
        if (["Enter", "NumpadEnter"].contains(ev.code)) {
            qc.sheet.page({"contrl": this.contrl, "curr": qc(this), "ev": ev});
        }
    }
};