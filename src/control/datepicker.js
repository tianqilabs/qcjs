qc.c.datepicker = {
    control: "datepicker",
    show: function (obj) {
        var curr = obj.curr,
            mode = curr.attr("qc-mode"),
            target = curr.attr("qc-target") ? qc(curr.attr("qc-target")) : curr,
            bar = [
                {"name": "ok", "fn": "qc.datepicker.confirm"},
                {"name": "cancel", "fn": "qc.datepicker.hide"}
            ],
            noCancel = "",
            timer = "";

        if (mode.contains("nobar")) {
            mode = mode.replace("nobar", "");
            bar = "";
        }

        if (mode.contains("nocancel")) {
            mode = mode.replace("nocancel", "");
            noCancel = 1;
        }

        if (mode.contains("timer")) {
            mode = mode.replace("timer", "");
            timer = 1;
        }

        mode = mode.replace(/\s+/g, "") || "date";

        qc.popfrm.dyShow(qc.lang.datepicker["title"], bar, "", curr, function (popfrm) {
            var today = new Date(),
                content = popfrm.find("[qc-content]");

            content.css("padding", 0);
            popfrm.addClass("qc-datepicker");

            var date = today,
                dateStr = curr.val();

            if (dateStr) {
                dateStr = dateStr.replace(/[-\.]/gi, "/");
                var dt = new Date(dateStr);
                if (!isNaN(dt.getTime()))
                    date = dt;
            }

            content[0].date = date;
            content[0].mode = mode;
            content[0].target = target;
            content[0].bar = bar ? 1 : "";
            content[0].noCancel = noCancel;

            qc.datepicker.createContent(content);
            qc.datepicker.format(content);

            if (timer) {
                content[0].refresh = qc.datepicker.refresh;
                content[0].refresh(content);
            }

            if (!bar)
                popfrm.find("[qc-warp]").attr("qc-fn", "qc.datepicker.confirm").removeAttr("qc-type");
        });
    },
    createContent: function (content) {
        var mode = content[0].mode;
        if (["date", "datetime"].contains(mode)) {
            var ymbar = qc("" +
                "<div class='qc-datepicker-bar'>" +
                "   <div class='qc-datepicker-ymbox'>" +
                "       <span years qc-fn='qc.datepicker.ymShow'></span>" +
                "   </div>" +
                "   <div class='qc-datepicker-buttons'>" +
                "       <span class='qc-datepicker-up' qc-fn='qc.datepicker.udpick'></span>" +
                "       <span class='qc-datepicker-down' qc-fn='qc.datepicker.udpick'></span>" +
                "   </div>" +
                "</div>");
            content.append(ymbar);

            qc.util.icon(ymbar.find(".qc-datepicker-up"), "up");
            qc.util.icon(ymbar.find(".qc-datepicker-down"), "down");

            var datebar = qc("<div class='qc-datepicker-bar'>" +
                "   <table class='qc-datepicker-dates'>" +
                "       <tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>");
            content.append(datebar);

            datebar.find("tr").eq(0).find("th").each(function (i) {
                var weeks = qc.lang.datepicker["weeks"];
                qc(this).html(weeks[i]);
            });

            datebar.find("td").attr("qc-fn", "qc.datepicker.datepick")
        }

        var timebar = qc("<div class='qc-datepicker-bar times'>");
        content.append(timebar);

        if (["datetime", "time"].contains(mode)) {
            var hms = qc("" +
                "   <span class='qc-datepicker-hour' qc-fn='qc.datepicker.hmsShow'></span> : " +
                "   <span class='qc-datepicker-minute' qc-fn='qc.datepicker.hmsShow'></span> : " +
                "   <span class='qc-datepicker-second' qc-fn='qc.datepicker.hmsShow'></span> " +
                "");
            timebar.append(hms);
        }

        if (["datetime", "date", "time"].contains(mode)) {
            var today = qc("" +
                (mode != "time" ?
                    "   <span class='qc-datepicker-today' qc-fn='qc.datepicker.today'>" + qc.lang.datepicker["today"] + "</span>" : "") +
                (!content[0].noCancel ?
                    "   <span class='qc-datepicker-cancel' qc-fn='qc.datepicker.cancel'>" + qc.lang.datepicker["cancel"] + "</span>" : "") +
                "");
            timebar.append(today);
        }

        if (["date", "datetime"].contains(mode)) {
            var ympicker = qc("" +
                "<div class='qc-datepicker-ympicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>"
            );
            timebar.before(ympicker);
            ympicker.find("td").attr("qc-fn", "qc.datepicker.ympick");
        }

        if (["datetime", "time"].contains(mode)) {
            var hpicker = qc("" +
                "<div class='qc-datepicker-hpicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>");
            var mspicker = qc("" +
                "<div class='qc-datepicker-mspicker'>" +
                "   <table>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "       <tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
                "   </table>" +
                "</div>" +
                "");
            if (mode == "time")
                timebar.after(hpicker).after(mspicker);
            else
                timebar.before(hpicker).before(mspicker);

            hpicker.find("td").each(function (i) {
                qc(this).attr("qc-fn", "qc.datepicker.hmspick").attr("v", i).html(i);
            });

            mspicker.find("td").each(function (i) {
                qc(this).attr("qc-fn", "qc.datepicker.hmspick").attr("v", i).html(i);
            });
        }

    },
    format: function (content) {
        qc.datepicker.formatym(content);
        qc.datepicker.formatDates(content);
        qc.datepicker.formatTimes(content);
        qc.datepicker.layout(content, 0);
    },
    formatym: function (content) {
        var mode = content[0].mode;
        if (!["date", "datetime"].contains(mode))
            return;

        var dt = content[0].date,
            year = dt.getFullYear(),
            month = dt.getMonth();

        var years = qc.lang.datepicker["years"];
        var months = qc.lang.datepicker["months"];

        var ny = years.split("/").map(function (y) {
            if (y.contains("m")) {
                return "<span month='" + month + "' qc-fn='qc.datepicker.ymShow'>" + y.replace(/m/, months[month]) + "</span>";
            } else if (y.contains("y")) {
                return "<span year='" + year + "' qc-fn='qc.datepicker.ymShow'>" + y.replace(/y/, year) + "</span>";
            }
        }).join("");

        var ymbox = content.find(".qc-datepicker-ymbox");
        ymbox.find("[year], [month]").remove();
        ymbox.append(ny);

        ymbox.find("[years]").hide();
        ymbox.find("[year]").show();
        ymbox.find("[month]").show();
    },
    formatDates: function (content) {
        var mode = content[0].mode;
        if (!["date", "datetime"].contains(mode))
            return;

        var dt = content[0].date,
            year = dt.getFullYear(),
            month = dt.getMonth();

        var dte = new Date(year, month + 1, 1);
        dte.setDate(dte.getDate() - 1);
        var datee = dte.getDate();

        var dates = 1;
        var dts = new Date(year, month, dates);
        var days = dts.getDay();
        if (days == 0) days = 7;

        var dtb = new Date(year, month, 1);
        dtb.setDate(dtb.getDate() - 1);
        var dateb = dtb.getDate();

        var tb = content.find(".qc-datepicker-dates");
        tb.find("td").removeClass("other");
        var tr = tb.find("tr");
        var rows = 1;

        // befor month;
        if (days > 1) {
            var dayb = days - 2;
            var y = year, m = month;
            m = m - 1;
            if (m == -1) {
                y--;
                m = 11;
            }
            while (rows == 1) {
                var td = tr.eq(rows).find("td").eq(dayb);
                td.attr("year", y).attr("month", m).attr("date", dateb);
                td.addClass("other").html(dateb);
                dayb--;
                dateb--;
                if (dayb < 0) {
                    break;
                }
            }
        }

        // curr month;
        while (dates <= datee) {
            var td = tr.eq(rows).find("td").eq(days - 1);
            td.attr("year", year).attr("month", month).attr("date", dates);
            td.html(dates);
            days++;
            dates++;
            if (days > 7) {
                rows++;
                days = 1;
            }
        }

        // next month;
        dates = 1, y = year, m = month;
        m = m + 1;
        if (m == 12) {
            y++;
            m = 0;
        }
        while (rows < 7) {
            var td = tr.eq(rows).find("td").eq(days - 1);
            td.attr("year", y).attr("month", m).attr("date", dates);
            td.addClass("other").html(dates);
            days++;
            dates++;
            if (days > 7) {
                rows++;
                days = 1;
            }
        }

        qc.datepicker.date(content);
    },
    formatTimes: function (content) {
        var mode = content[0].mode;
        if (!["time", "datetime"].contains(mode))
            return;

        var dt = content[0].date;
        var hour = dt.getHours();
        var minute = dt.getMinutes();
        var second = dt.getSeconds();

        var h = ("0" + hour).slice(-2);
        var m = ("0" + minute).slice(-2);
        var s = ("0" + second).slice(-2);

        content.find(".qc-datepicker-hour").attr("hour", h).html(h);
        content.find(".qc-datepicker-minute").attr("minute", m).html(m);
        content.find(".qc-datepicker-second").attr("second", s).html(s);
    },
    date: function (content) {
        var dt = content[0].date, now = new Date(),
            year = dt.getFullYear(),
            month = dt.getMonth(),
            date = dt.getDate();

        var tb = content.find(".qc-datepicker-dates");
        tb.find("td.picked, td.today").removeClass("picked today");

        var picked = tb.find("td[year='" + year + "'][month='" + month + "'][date='" + date + "']");
        picked.addClass("picked");

        var today = tb.find("td[year='" + now.getFullYear() + "'][month='" + now.getMonth() + "']" +
            "[date='" + now.getDate() + "']");
        if (today.length > 0) {
            today.addClass("today");
        }
        // day.addClass("picked");
        // if (year == now.getFullYear() && month == now.getMonth() && date == now.getDate())
        //     day.addClass("today");

    },
    refresh: function (content) {
        var refresh = content[0].refresh;
        if (!refresh) return;

        var now = new Date(),
            dt = content[0].date;

        if (dt == undefined) return;

        dt.setHours(now.getHours());
        dt.setMinutes(now.getMinutes());
        dt.setSeconds(now.getSeconds());
        content[0].date = dt;
        qc.datepicker.formatTimes(content);
        qc.datepicker.date(content);

        setTimeout(function () {
            refresh(content)
        }, 1000);
    },
    ymShow: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            ymbox = content.find(".qc-datepicker-ymbox"),
            ympicker = content.find(".qc-datepicker-ympicker");

        var spanys = ymbox.find("[years]"),
            spany = ymbox.find("[year]"),
            spanm = ymbox.find("[month]");

        if (ympicker.isShow()) {
            ympicker.hide();
            qc.datepicker.layout(content, 0);
            qc.datepicker.formatym(content);
            return;
        }

        var year = curr.attr("year"), month = curr.attr("month");

        spanm.hide();
        if (year) {
            spany.hide();
            spanys.show();
            qc.datepicker.yShow(year, spanys, ympicker);
        } else if (month) {
            spanys.hide();
            spany.show();
            qc.datepicker.mShow(month, ympicker);
        }

        qc.datepicker.layout(content, 1);
        ympicker.show();
    },
    yShow: function (year, spanys, ympicker) {
        var s0 = parseInt(year.slice(0, -1) + "0"),
            s = s0 - 3, e = s0 + 9;

        spanys.html(s0 + "-" + e).attr("s0", s0);

        ympicker.find("td").each(function () {
            var td = qc(this).removeClass("picked other");
            td.removeAttr("month").html(s);
            td.attr("year", s);
            if (s < s0 || s > s0 + 9) {
                td.addClass("other");
            }

            if (s == parseInt(year))
                td.addClass("picked");
            s++;
        });
    },
    mShow: function (month, ympicker) {
        var s = 0, e = 16;
        ympicker.find("td").each(function () {
            var td = qc(this).removeClass("picked other");
            td.removeAttr("year");
            td.attr("month", s);
            if (s > 11) {
                td.addClass("other");
                td.html(s + 1 - 12);
            } else
                td.html(s + 1);

            if (s == parseInt(month))
                td.addClass("picked");
            s++;
        });
    },
    ympick: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            ympicker = content.find(".qc-datepicker-ympicker");

        var year = curr.attr("year"), month = curr.attr("month"),
            dt = content[0].date;

        if (year) {
            dt.setFullYear(year);
        } else if (month) {
            dt.setFullYear(content.find(".qc-datepicker-ymbox [year]").attr("year"));
            dt.setMonth(month);
        }
        content[0].date = dt;
        qc.datepicker.format(content);
        ympicker.hide();
    },
    datepick: function (obj) {
        var curr = obj.curr,
            content = obj.contrl.find("[qc-content]"),
            year = curr.attr("year"),
            month = curr.attr("month"),
            date = curr.attr("date");

        var dt = content[0].date;
        dt.setFullYear(year);
        dt.setMonth(month);
        dt.setDate(date);
        content[0].date = dt;
        qc.datepicker.date(content);
        // if (!content[0].bar) {
        //     qc.datepicker.confirm({"contrl": content.closest("[qc-control]")});
        // }
    },
    udpick: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]"),
            ymbox = content.find(".qc-datepicker-ymbox"),
            ympicker = content.find(".qc-datepicker-ympicker"),
            spanys = ymbox.find("[years]"),
            spany = ymbox.find("[year]"), spanm = ymbox.find("[month]"), up = 0;

        if (curr.is(".qc-datepicker-up"))
            up = -1;
        if (curr.is(".qc-datepicker-down"))
            up = 1;
        if (ympicker.isShow()) {
            if (spanys.isShow()) {
                var s0 = parseInt(spanys.attr("s0")) + up * 10;
                qc.datepicker.yShow(s0 + "", spanys, ympicker);
            } else {
                var s0 = parseInt(spany.attr("year")) + up;
                spany.attr("year", s0);
                spany.html(spany.html().replace(/\d+/gi, s0));
            }
        } else {
            var mstr = "", ystr = "";
            qc.lang.datepicker["years"].split("/").each(function (arr) {
                if (arr.contains("m")) {
                    mstr = arr;
                } else if (arr.contains("y")) {
                    ystr = arr;
                }
            });

            var s0 = parseInt(spanm.attr("month")) + up;
            var dt = content[0].date;
            dt.setMonth(s0);
            content[0].date = dt;

            var y = dt.getFullYear(), m = dt.getMonth();
            spanm.attr("month", m);
            spanm.html(mstr.replace(/m/, qc.lang.datepicker["months"][m]));
            spany.attr("year", y);
            spany.html(ystr.replace(/y/, y));

            qc.datepicker.formatDates(content);
        }
    },
    today: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]");

        content[0].date = new Date();
        qc.datepicker.format(content);

        if (!content[0].bar) {
            qc.datepicker.confirm({"contrl": content.closest("[qc-control]")});
        } else if (!content[0].refresh) {
            content[0].refresh = qc.datepicker.refresh;
            content[0].refresh(content);
        }
    },
    cancel: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]");

        content[0].date = undefined;
        qc.datepicker.confirm(obj);
    },
    hmsShow: function (obj) {
        var curr = obj.curr,
            content = curr.closest("[qc-content]"),
            dt = content[0].date;

        var hour = curr.attr("hour"),
            minute = curr.attr("minute"),
            second = curr.attr("second"),
            picker = hour ? "hour" : minute ? "minute" : second ? "second" : "";

        var hpicker = content.find(".qc-datepicker-hpicker"),
            mspicker = content.find(".qc-datepicker-mspicker");

        var obj = picker == "hour" ? hpicker : mspicker;

        if (obj.isShow() && obj.attr("picker") == picker) {
            obj.removeAttr("picker");
            obj.hide();
            qc.datepicker.layout(content, 0);
            return;
        }

        hpicker.hide();
        mspicker.hide();

        if (picker == "hour") {
            value = dt.getHours();
        } else if (picker == "minute") {
            value = dt.getMinutes();
        } else if (picker == "second") {
            value = dt.getSeconds();
        }

        if (value != undefined) {
            obj.find("td.picked").removeClass("picked");
            obj.find("td[v='" + value + "']").addClass("picked");
            obj.attr("picker", picker).show();

            qc.datepicker.layout(content, picker);
        }
    },
    hmspick: function (obj) {
        var curr = obj.curr,
            value = curr.attr("v"),
            picker = curr.closest("[picker]"),
            pickerName = picker.attr("picker"),
            content = picker.closest("[qc-content]");

        var dt = content[0].date;
        if (pickerName == "hour") {
            dt.setHours(value);
        } else if (pickerName == "minute") {
            dt.setMinutes(value);
        } else if (pickerName == "second") {
            dt.setSeconds(value);
        }
        content[0].date = dt;
        content[0].refresh = undefined;
        qc.datepicker.formatTimes(content);

        picker.removeAttr("picker");
        picker.hide();
        qc.datepicker.layout(content, 0);
    },
    confirm: function (obj) {
        var contrl = obj.contrl,
            content = contrl.find("[qc-content]"),
            tar = content[0].target;

        var date = qc.datepicker.formatDate(content[0].date, content[0].mode);
        if (tar[0].value != undefined) {
            tar.val(date);
        } else {
            tar.html(date);
        }
        tar.change();
        qc.datepicker.hide(obj);
    },
    formatDate: function (dt, mode) {
        if (!dt) return "";

        var y = dt.getFullYear(),
            M = ("0" + (dt.getMonth() + 1)).slice(-2),
            d = ("0" + dt.getDate()).slice(-2),
            h = ("0" + dt.getHours()).slice(-2),
            m = ("0" + dt.getMinutes()).slice(-2),
            s = ("0" + dt.getSeconds()).slice(-2);

        if (mode == "datetime") {
            return y + "-" + M + "-" + d + " " + h + ":" + m + ":" + s;
        } else if (mode == "time") {
            return h + ":" + m + ":" + s;
        }
        return y + "-" + M + "-" + d;
    },
    layout: function (content, type) {
        var bars = content.find(".qc-datepicker-bar"),
            times = content.find(".qc-datepicker-bar times"),
            years, dates, times, ympicker, hpicker, mspicker;

        if (bars.length == 1) {
            times = bars.eq(0);
            mspicker = times.next();
            hpicker = mspicker.next();
        } else {
            years = bars.eq(0);
            dates = bars.eq(1);
            times = bars.eq(2);
            ympicker = bars.eq(1).next();
            hpicker = ympicker.next();
            mspicker = hpicker.next();
        }

        times.find("[hour], [minute], [second]").removeClass("selected");

        if (type == 0) {
            hpicker.hide();
            mspicker.hide();

            if (years) {
                bars.show();
                ympicker.hide();

                var datetb = dates.contents("table");

                ympicker.find("table").width(datetb.width());
                ympicker.find("table").height(datetb.height());

                hpicker.find("table").width(datetb.width());
                hpicker.find("table").height(years.height() + dates.height());

                mspicker.find("table").width(datetb.width());
                mspicker.find("table").height(years.height() + dates.height());
            }
        } else if (type == 1) {
            hpicker.hide();
            mspicker.hide();
            times.hide();

            if (years) {
                years.show();
                dates.hide();
                ympicker.show();
            }

        } else if (type == "hour" || "minute" || "second") {
            times.show();
            mspicker.hide();

            if (years) {
                years.hide();
                dates.hide();
                ympicker.hide();
            }

            if (type == "hour") {
                hpicker.show();
                mspicker.hide();
            } else {
                hpicker.hide();
                mspicker.show();
            }

            times.find("[" + type + "]").addClass("selected");

            qc.popfrm.layout(content.closest("[qc-control]"));
        }

    },
    hide: function (obj) {
        obj.contrl.find("[qc-content]")[0].refresh = undefined;
        qc.popfrm.hide(obj);
    }
};