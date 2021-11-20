qc.util.setLangDir("../lang");
qc.util.setLangGlobal("global.js");

qc.util.addStart(menuInit);

function menuInit() {
    var menu = qc(".menu").append("" +
        "<select class='lang' qc-control='selector' qc-type='change' qc-post='nav'  " +
        "qc-mode='normal' qc-field='k' qc-text='v' qc-default='" + qc("html").attr("lang") + "'>");
    menu.append("" +
        "<ul>\n " +
        "   <li>" +
        "       <div>core</div>\n " +
        "       <ul>\n " +
        "           <li><a href='qc.html' qc-lang='menu' qc-lang-name='qc', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='manipulation.html' qc-lang='menu' qc-lang-name='manipulation', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='traversing.html' qc-lang='menu' qc-lang-name='traversing', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='events.html' qc-lang='menu' qc-lang-name='events', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='qcset.html' qc-lang='menu' qc-lang-name='qcset', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='other.html' qc-lang='menu' qc-lang-name='other', qc-lang-attr='html'></a></li>\n" +
        "       </ul>" +
        "   </li>\n " +
        "   <li>" +
        "       <div>小部件</div>" +
        "       <ul>\n " +
        "           <li><a href='util.html' qc-lang='menu' qc-lang-name='util', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='attribute.html' qc-lang='menu' qc-lang-name='attribute', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='icon.html' qc-lang='menu' qc-lang-name='icon', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='lang.html' qc-lang='menu' qc-lang-name='lang', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='popfrm.html' qc-lang='menu' qc-lang-name='popfrm', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='colorpicker.html' qc-lang='menu' qc-lang-name='colorpicker', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='selector.html' qc-lang='menu' qc-lang-name='selector', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='editor.html' qc-lang='menu' qc-lang-name='editor', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='datepicker.html' qc-lang='menu' qc-lang-name='datepicker', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='lister.html' qc-lang='menu' qc-lang-name='lister', qc-lang-attr='html'></a></li>\n" +
        "           <li><a href='treeview.html' qc-lang='menu' qc-lang-name='treeview', qc-lang-attr='html'></a></li>\n" +
        "       </ul>" +
        "   </li>" +
        "</ul>\n" +
        "");
}

qc.util.addInited(function () {
    var iconTag = qc("<blockquote></blockquote>"),
        translateTag = qc("<blockquote></blockquote>");

    var right = qc(".right");
    if (qc.lang.quote["translate"]) {
        right.prepend(translateTag.html(qc.lang.quote["translate"]));
    }

    if (qc.lang.quote["icon"]) {
        right.prepend(iconTag.html(qc.lang.quote["icon"]));
    }

    global();
});

function global () {
    var data = [];
    for (var name in qc.lang.global) {
        data.push({"k": name, "v": qc.lang.global[name]});
    }
    qc.selector.addItem(".lang", data);
}

qc.util.addInited(function () {
    // setTop();
    setSelected();
    resetPre();
});

function setTop() {
    var top = qc("#top");
    if (!top[0]) {
        top = qc("<div id='top'><i class='fa fa-angle-up'></i></div>");
        top.unbind("click").bind("click", function () {
            qc(".right").scrollTop(0);
        });
        qc(".right").append(top);
    }
    qc(".right").on("scroll", function (ev) {
        if (this.scrollTop == 0) {
            top.hide();
        } else {
            top.show();
        }
        setSelected();
    });
}

function setSelected() {
    var url = location.href;
    qc(".menu a").each(function () {
        var obj = qc(this), v = obj.attr("qc-lang-name") + ".html";
        if (url.contains(v)) {
            obj.addClass("selected");
        }
    });
}

function nav(obj) {
    var curr = obj.curr,
        lang = qc.selector.val(curr),
        page = qc(".menu a.selected").attr("qc-lang-name");

    location = "../" + lang + "/" + page + ".html";
}

function resetPre() {
    qc(".code").each(function () {
        var code = qc(this),
            html = code.html(),
            arrs = html.split("\n"),
            arr1 = arrs[1],
            m = arr1.match(/^\s+/),
            reg;

        if (m) {
            reg = new RegExp("(^\\s{0," + m[0].length + "})|(\\s+$)");
        }
        var lines = arrs.map(function (v, idx) {
            return v.replace(reg, "")
                .replace(/</g, "&lt;")
                .replace(/</g, "&gt;");
        });
        // lines[0] = lines[0] + lines[1];
        // lines.splice(1, 1);
        // lines.splice(-1, 1);
        code.html(lines.join("\n"));

        var ol = qc("<ul>");
        qc(this).append(ol);
        for (var i = 1; i < lines.length; i++) {
            ol.append("<li>" + i + "</li>");
        }
        // qc(this).find("code").css("margin-left", (ol.outerWidth() + 16) + "px");
    });
}

