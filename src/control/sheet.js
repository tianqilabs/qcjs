qc.c.sheet = {
    control: "sheet",
    create: function (obj) {
        var mode = obj.attr("qc-mode"),
            getUrl = obj.attr("qc-get"),
            table = obj.contents("table");

        if (mode) {
            obj[0].multi = mode.contains("multiple");
            mode = mode.contains("manual") ? "" : "auto";
        }

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

        if (getUrl && mode.contains("auto")) {
            qc.sheet.get(obj, {});
        } else {
            var data = [];
            qc.sheet.fromat(table, data);
            qc.sheet.layout(obj);
            var d = {
                "data": data,
                "rows": data.length,
                "count": data.length,
                "pages": 1,
                "page": 1
            };
            qc.sheet.pages(d, obj);
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

        var inpt = qc("<input type='text' class='' v='page' qc-type='change' qc-fn='qc.sheet.page'>");
        qc.util.lang(inpt, "page", "title", "sheet");
        foot.append(inpt);
        // inpt[0].contrl = contrl;
        // inpt.keyup(qc.sheet.keyup);

        foot.append("<span>/</span><span v='pages'></span>");

        var right = qc("<span class='qc-sheet-page' qc-type='page' v='right'>");
        qc.util.icon(right, "right", "sheet");
        qc.util.lang(right, "right", "title", "sheet");
        foot.append(right);

        var last = qc("<span class='qc-sheet-page' qc-type='page' v='last'>");
        qc.util.icon(last, "last", "sheet");
        qc.util.lang(last, "last", "title", "sheet");
        foot.append(last);

        var rowsp = qc("<span class='total'>"),
            rows = qc("<span v='rows' class='total'>"),
            totalp = qc("<span class='total'>"),
            total = qc("<span v='count' class='total'>");

        qc.util.lang(rowsp, "rows", "html", "sheet");
        qc.util.lang(totalp, "total", "html", "sheet");
        foot.append(rowsp).append(rows).append(totalp).append(total);

    },
    fromat: function (table, data) {
        var ths = [];
        table.find("thead th").each(function (idx) {
            var th = qc(this),
                fixed = th.attr("qc-fixed") != undefined ? "fixed" : "",
                field = th.attr("qc-field") || idx,
                text = th.attr("qc-text") || "";

            ths.push({"fixed": fixed, "field": field, "text": text});
        });
        table.find("tbody tr").each(function () {
            var b = {};
            qc(this).find("td").each(function (idx) {
                var td = qc(this),
                    th = ths[idx];

                if (th.fixed) {
                    td.attr("qc-fixed", "");
                }
                td.attr("qc-field", th.field);

                var value = td.attr("qc-value");
                if (value == undefined) {
                    var html = td.html();
                    if (th.text) {
                        var ts = JSON.parse(text);
                        for (var k in ts) {
                            if (ts[k] == html) {
                                value = k;
                                break;
                            }
                        }
                    }
                    value = value || html;
                    td.attr("qc-value", value);
                }

                b[th.field] = value;

            });
            data.push(b);
        });
    },
    get: function (contrl, args, callee) {
        args = args || {};
        args.page = contrl.attr("qc-page") || 1;
        args.count = contrl.attr("qc-count") || 20;
        qc.util.get(contrl, args, function (d, re) {
            qc.sheet.fill(d, re, callee);
        });
    },
    fill: function (d, re, callee) {
        var contrl = re.contrl;
        contrl.find(".qc-sheet-head-y, .qc-sheet-data-x, .qc-sheet-head-x, .qc-sheet-scroll").remove();

        var key = contrl.attr("qc-key"),
            tb = contrl.find("[qc-content] table"),
            hideField = contrl[0].hideField,
            ths = tb.find("thead th").show();

        if (hideField) {
            var _ths = [];
            ths.each(function () {
                var th = qc(this),
                    f = th.attr("qc-field");
                if (hideField.contains(f)) {
                    th.hide();
                } else {
                    _ths.push(th);
                }
            });
            ths = _ths;
        }

        var tbody = tb.find("tbody").empty();
        for (var i = 0; i < d.rows; i++) {
            var b = d.data[i],
                tr = qc("<tr>");

            if (key) {
                tr.attr("qc-field", key);
                tr.attr("qc-value", b[key]);
            }
            tbody.append(tr);
            qc.sheet.fill_tr(tr, ths, b);
        }

        qc.sheet.pages(d, contrl);

        var fn = callee || contrl[0].callback, fre;
        if (fn) {
            fre = fn(d, re);
        }
        if (fre == false)
            return;

        qc.sheet.layout(re.contrl);

    },
    fill_tr: function (tr, ths, b) {
        for (var i = 0; i < ths.length; i++) {
            var th = qc(ths[i]),
                field = th.attr("qc-field"),
                fixed = th.attr("qc-fixed") == undefined ? "" : "qc-fixed",
                text = th.attr("qc-text"),
                val = b[field];

            if (text) {
                var ts = JSON.parse(text);
                val = ts[val];
            }

            tr.append("<td qc-field='" + field + "' qc-value='" + b[field] + "' " + fixed + ">" + val + "</td>");
        }
    },
    layout: function (contrl) {
        var cont = contrl.find("[qc-content]"),
            warp = cont.find("[qc-warp]"),
            tb = warp.find("table"),
            thead_y = qc("<div class='qc-sheet-head-y'>"),
            data_x = qc("<div class='qc-sheet-data-x'>"),
            thead_x = qc("<div class='qc-sheet-head-x'>"),
            scroll = qc("<div class='qc-sheet-scroll'>"),
            tbw = tb.width(),
            warpw = warp.width();

        tb.width(tbw < warpw ? warpw : tbw);
        cont.append(thead_y.append(tb.clone()));
        cont.append(data_x.append(tb.clone()));
        cont.append(thead_x.append(tb.clone()));
        cont.append(scroll.append(tb.clone()));

        contrl[0].warp = warp;
        contrl[0].thead_y = thead_y;
        contrl[0].data_x = data_x;
        contrl[0].thead_x = thead_x;
        contrl[0].scroll = scroll;

        scroll.off("click").on("click", qc.sheet.selected);
        scroll.off("scroll").on("scroll", qc.sheet.scroll);
    },
    scroll: function (ev) {
        var contrl = qc(this).closest("[qc-control]")[0];
        if (this.st != this.scrollTop) {
            this.st = this.scrollTop;
            contrl.data_x[0].scrollTop = this.st;
            contrl.warp[0].scrollTop = this.st;
        } else {
            this.sl = this.scrollLeft;
            contrl.thead_y[0].scrollLeft = this.sl;
            contrl.warp[0].scrollLeft = this.sl;
        }
    },
    pages: function (d, contrl) {
        var page = parseInt(contrl.attr("qc-page")) || 1,
            foot = contrl.find("[qc-foot]");

        var pages = d.pages || 1;
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

        if (d.rows) {
            foot.find("[v='rows']").show().html(d.rows);
        } else {
            foot.find("[v='rows']").hide().html("");
        }
        if (d.count) {
            foot.find("[v='count']").show().html(d.count);
        } else {
            foot.find("[v='count']").hide().html("");
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
    // keyup: function (ev) {
    //     if (["Enter", "NumpadEnter"].contains(ev.code)) {
    //         qc.sheet.page({"contrl": this.contrl, "curr": qc(this), "ev": ev});
    //     }
    // },
    selected: function (ev) {
        var x = ev.pageX,
            y = ev.pageY,
            curr = qc(ev.target),
            contrl = curr.closest("[qc-control='sheet']");

        if (contrl[0]) {
            var warp = contrl.find("[qc-warp]"),
                data_x = contrl[0].data_x,
                tds = contrl.find("td"),
                multi = contrl[0].multi,
                tr;

            tds.each(function () {
                var td = qc(this),
                    l = td.offset().left,
                    r = l + td.width(),
                    t = td.offset().top,
                    b = t + td.height();

                if (x >= l && x <= r && y >= t && y <= b) {
                    tr = td.closest("tr");
                    return false;
                }
            });
            if (tr) {
                var idx = tr.index() + 1,
                    trf = data_x.find("tr").eq(idx),
                    has = tr.hasClass("selected");

                if (multi) {
                    if (has) {
                        tr.removeClass("selected");
                        trf.removeClass("selected");
                    } else {
                        tr.addClass("selected");
                        trf.addClass("selected");
                    }
                } else {
                    warp.find("tr").removeClass("selected");
                    data_x.find("tr").removeClass("selected");
                    if (!has) {
                        tr.addClass("selected");
                        trf.addClass("selected");
                    }
                }

                if (contrl.attr("qc-post")) {
                    var seleds = [];
                    warp.find("tr.selected").each(function () {
                        seleds.push(qc(this).attr("qc-value"));
                    });

                    var args = {};
                    qc.util.getFields(tr, "", args);
                    args.key = contrl.attr("qc-key") || "";
                    args.selected = seleds.join(",");
                    qc.util.post(tr, args);
                }
            }
        }
    },
    setHide: function (contrl) {
        var fields = [];
        for (var i = 1; i < arguments.length; i++) {
            fields.push(arguments[i]);
        }
        contrl[0].hideField = fields;
    },
    refresh: function (contrl) {
        contrl.find("[qc-foot] input").change();
    }
};