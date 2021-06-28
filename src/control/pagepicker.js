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

qc.c.pagepicker = {
    control: "pagepicker",
    create: function (obj) {
        obj.hide();
        obj.addClass("qc-pagepicker");
    },
    show: function (contrl, origin, pages) {
        contrl[0].origin = origin;
        contrl.empty();

        var _page = origin.attr("qc-page") || 1,
            _count = origin.attr("qc-count") || 20,
            _pc = contrl.attr("qc-count") || 10;

        var page = parseInt(_page);
        var count = parseInt(_count);
        var pc = parseInt(_pc);

        var p = Math.floor((page - 1) / pc) * pc + 1;

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