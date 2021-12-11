qc.c.pagepicker = {
    control: "pagepicker",
    create: function (obj) {
        obj.hide();
        obj.addClass("qc-pagepicker");
    },
    show: function (contrl, origin, pages) {
        contrl[0].origin = origin;
        contrl.empty();

        var _page = origin.attr("qc-page") || 0,
            _count = origin.attr("qc-count") || 0,
            _pc = contrl.attr("qc-count") || 10;

        if (_page == 0 && _count == 0)
            return;

        var page = parseInt(_page),
            pc = parseInt(_pc),
            p = Math.floor((page - 1) / pc) * pc + 1;

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