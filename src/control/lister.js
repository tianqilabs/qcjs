/*
 * Copyright 2020 老李, 20390965@qq.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
