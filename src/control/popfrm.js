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

qc.c.popfrm = {
    control: "popfrm",
    create: function (arg) {
        var obj = qc(arg);
        if (obj.length == 0) return;
        obj.hide();

        var warp = obj.find("[qc-warp]"),
            container = obj.find("[qc-container]"),
            content = obj.find("[qc-content]"),
            btns = obj.attr("qc-buttons"),
            title = obj.attr("qc-title"),
            contStr = obj.attr("qc-content");

        if (warp.length == 0) {
            warp = qc("<div class='qc-warp' qc-warp>");
            obj.prepend(warp);
        }
        if (container.length == 0) {
            container = qc("<div class='qc-container' qc-container>");
            obj.append(container);
        }
        if (btns || title) {
            qc.popfrm.createToolbar(title, btns, container);
        }
        if (content.length == 0) {
            content = qc("<div class='qc-content' qc-content>");
            container.append(content);
        }
        if (contStr) {
            content.html(contStr);
        }
        if (container.find("[qc-buttons] a").length == 0) {
            warp.attr("qc-type", "hide");
        }
    },
    show: function (obj) {
        var curr = obj.curr,
            popfrm = qc(curr.attr("qc-target")),
            callee = curr.attr("qc-fn");

        if (popfrm[0]) {
            popfrm[0].origin = curr;
            popfrm[0].isHide = true;

            popfrm.show();

            var callee = qc.util.convert2fnc(callee);
            if (callee)
                callee(popfrm);
            qc.popfrm.layout(popfrm);
        } else {
            var title = curr.attr("qc-title"),
                btn = curr.attr("qc-buttons"),
                cont = curr.contents(), content = curr.attr("qc-content") || "";

            var node = cont[0];
            while (node) {
                if (node.nodeType == 8) {
                    content += node.textContent + "\n";
                }
                node = node.nextSibling;
            }
            qc.popfrm.dyShow(title, btn, content, curr, callee);
        }
    },
    dyShow: function (title, btn, content, originObj, callee) {
        var popfrm = qc("<div class='qc-popfrm' qc-control='popfrm'>"),
            container = qc("<div class='qc-container' qc-container>"),
            warp = qc("<div class='qc-warp' qc-warp>");

        qc("body").append(popfrm);
        popfrm.append(warp).append(container);

        var btnLen = qc.popfrm.createToolbar(title, btn, container);
        if (btnLen == 0) {
            warp.attr("qc-type", "hide");
        }

        var cont = qc("<div class='qc-content' qc-content>");
        container.append(cont);

        if (typeof content == "object" && content.src) {
            popfrm[0].src = content.src;
            cont.addClass("qc-popfrm-iframe");
            cont.append("<iframe src='" + content.src + "'>");
        }
        if (typeof content == "string") {
            cont.append(content);
        }

        popfrm[0].origin = originObj;
        popfrm[0].isHide = false;
        popfrm.show();

        if (callee) {
            callee(popfrm);
        }
        qc.popfrm.layout(popfrm);
    },
    createToolbar: function (title, btn, container) {
        var toolbar  = container.find("[qc-toolbar]"), btnLen = 0;

        if (title || btn) {
            if (!toolbar[0]) {
                toolbar = qc("<div class='qc-toolbar' qc-toolbar>");
                container.prepend(toolbar);
            }

            var popTitle = toolbar.find("[qc-title]");
            if (!popTitle[0]) {
                popTitle = qc("<span class='qc-title' qc-title>");
                toolbar.append(popTitle);
            }
            if (!title) title = qc.lang.popfrm["title"];
            popTitle.html(title);

            btnLen = qc.popfrm.createButtons(btn, toolbar);
        }
        return btnLen;
    },
    createButtons: function (btn, toolbar) {
        if (!btn) return 0;

        var defBtn = {
            "cancel": {"title": qc.lang.popfrm["cancel"], "icon": "close", "text": "", "type": "hide"},
            "ok": {"title": qc.lang.popfrm["ok"], "icon": "ok"}
        }, btns = [], btnCancel = defBtn["cancel"], btnLen = 0;

        var _btn;
        if (typeof btn == "string") {
            _btn = btn.split(" ");
        } else {
            _btn = btn;
        }
        _btn.each(function (arr) {
            if (typeof arr == "string" && arr != "cancel")
                arr = defBtn[arr];
            if (typeof arr == "object") {
                var name = arr.name, _btn = defBtn[name];
                arr = qc._extend(arr, _btn);
                name == "cancel" ? btnCancel = arr : btns.push(arr);
            }
        });
        btns.push(btnCancel);

        btnLen = btns.length;
        if (btnLen > 0) {
            var buttons = toolbar.find("[qc-buttons]");
            if (!buttons[0]) {
                buttons = qc("<div class='qc-buttons' qc-buttons>");
                toolbar.append(buttons);
                buttons.empty();
            }
            btns.each(function (arr) {
                var a = qc("<a href='javascript:void(0);'>");
                buttons.append(a);

                a.attr("qc-type", arr.name == "cancel" && arr.fn ? "" : arr.type ? arr.type : "");
                qc.util.lang(a, arr.title, "title");
                if (arr.fn) {
                    a.attr("qc-fn", arr.fn);
                }
                if (arr.text) {
                    qc.util.lang(a, arr.text, "html");
                    a.prepend("&nbsp;")
                }
                if (arr.icon) {
                    qc.util.icon(a, arr.icon);
                }
                if (arr.title) {
                    a.attr("title", arr.title);
                }
            });

        }
        return btns.length;
    },
    hide: function (obj) {
        if (obj.contrl[0].isHide)
            obj.contrl.hide();
        else
            obj.contrl.remove();
    },
    layout: function (popfrm) {
        var originObj = popfrm[0].origin,
            docEl = popfrm[0].ownerDocument.documentElement,
            con = popfrm.find("[qc-container]"),
            warp = popfrm.find("[qc-warp]"),
            ifrm = popfrm.find(".qc-popfrm-iframe");

        var l, t, b, r, pos = "absolute";
        if (!originObj || popfrm[0].src) {
            t = "15%";
            l = "5%";
            r = "5%";
            b = "15%";
        } else {
            if (qc.util.mobile) {
                pos = "relative";
                t = warp.height() / 2 - con.height() /2 + "px";
            } else {
                if (originObj[0]) {
                    t = originObj.offset().top + originObj.height() - docEl.scrollTop;
                    l = originObj.offset().left;
                    if (t > warp.height() / 2)
                        t = t - con.height() - originObj.height();
                    if (l > warp.width() / 2)
                        l = l - con.width();
                    t += "px";
                    l += "px";
                }
            }
        }

        con.css({
            "position": pos,
            "top": t ? t : "auto",
            "left": l ? l : "auto",
            "right": r ? r : "auto",
            "bottom": b ? b : "auto",
        });

        if (ifrm[0]) {
            ifrm.css("height", "calc(100% - " + popfrm.find(".qc-toolbar").outerHeight() + "px");
        }
    }
};
