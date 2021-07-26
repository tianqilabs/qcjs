qc.c.colorpicker = {
    control: "colorpicker",
    show: function (obj) {
        var curr = obj.curr,
            mode = curr.attr("qc-colorpicker-mode"),
            cssName = curr.attr("qc-colorpicker-css") || "color",
            target = curr.attr("qc-target") ? qc(curr.attr("qc-target")) : curr,
            color = target.css(cssName);

        qc.colorpicker.dyShow(curr, color, mode, function (color) {
            target.css(cssName, color);
        });
    },
    dyShow: function (originObj, color, mode, callee) {
        qc.popfrm.dyShow(qc.lang.colorpicker["title"], [{
            "name": "ok",
            "fn": "qc.colorpicker.confirm"
        }], "", originObj, function (popfrm) {
            popfrm[0].callee = callee;
            popfrm.addClass("qc-colorpicker");

            var content = popfrm.find("[qc-content]");
            qc.colorpicker.createContent(content, color, mode, callee);
        });
    },
    createContent: function (content, color, mode, callee) {
        mode = mode || (qc.util.mobile ? "list" : "panel");
        if (mode == "panel") {
            qc.colorpicker.createPanel(content);
            qc.colorpicker.init(content, color);
        }
        if (mode == "list") {
            qc.colorpicker.createList(content, color);
        }
    },
    createPanel: function (content) {
        var html = "" +
            "<div class='qc-colorpicker-panel'>" +
            "   <canvas width='256' height='126'></canvas>" +
            "   <div class='qc-colorpicker-panel-pick'></div> " +
            "</div>" +
            "<div class='qc-colorpicker-bar'>" +
            "   <div class='qc-colorpicker-cur'></div>" +
            "   <canvas width='160' height='12' class='qc-colorpicker-color'></canvas>" +
            "   <div class='qc-colorpicker-bar-pick'></div> " +
            // "   <a class='qc-colorpicker-none' href='javascript:void(0);'> </a>" +
            "   <div style='width: 160px; height: 12px;' class='qc-colorpicker-a-back'></div>" +
            "   <canvas width='160' height='12' class='qc-colorpicker-a'></canvas>" +
            "   <div class='qc-colorpicker-bar-pick-a'></div> " +
            "</div>" +
            "<div class='qc-colorpicker-textbox'>" +
            "   <div><input type='text' class='qc-colorpicker-hex'></div>" +
            "   <div>HEX</div>" +
            "   <div>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "       <input type='text' class='qc-colorpicker-rgb'>" +
            "   <div>" +
            "       <div class='qc-colorpicker-rgb-text'>R</div>" +
            "       <div class='qc-colorpicker-rgb-text'>G</div>" +
            "       <div class='qc-colorpicker-rgb-text'>B</div>" +
            "       <div class='qc-colorpicker-rgb-text'>A</div>" +
            "</div>" +
            "</div>";
        content.css("padding", 0);
        content.append(html);

        content.find(".qc-colorpicker-panel")[0].onselectstart = function () {
            return false;
        };
        content.find(".qc-colorpicker-bar")[0].onselectstart = function () {
            return false;
        };
    },
    init: function (content, color) {
        qc.colorpicker.drawBar(content);

        color = !color || color == "transparent" ? "rgba(0,0,0,0)" : color;

        content[0].rgba = qc.colorpicker.str2rgba(color);

        var panel = content.find(".qc-colorpicker-panel");
        qc.colorpicker.event(panel, qc.colorpicker.setPanelPickP);

        var bar = content.find(".qc-colorpicker-bar");
        qc.colorpicker.event(bar, qc.colorpicker.setBarPickP);

        content.find(".qc-colorpicker-hex, .qc-colorpicker-rgb").change(function (ev) {
            if (qc(this).is(".qc-colorpicker-hex")) {
                content[0].rgba = qc.colorpicker.str2rgba(this.value);
            }
            if (qc(this).is(".qc-colorpicker-rgb")) {
                var rgba = [];
                content.find(".qc-colorpicker-rgb").each(function (i) {
                    var v = this.value.trim();
                    if (v.length == 0) v = 0;
                    rgba[i] = v;
                });
                content[0].rgba.r = rgba[0];
                content[0].rgba.g = rgba[1];
                content[0].rgba.b = rgba[2];
                content[0].rgba.a = rgba[3];
            }
            qc.colorpicker.setBarPick(content);
            qc.colorpicker.setPanelPick(content);
            qc.colorpicker.setTextBox(content);
        });

        qc.colorpicker.setBarPick(content);
        qc.colorpicker.setPanelPick(content);
        qc.colorpicker.setTextBox(content);
    },
    drawBar: function (content) {
        var colors = ["#f00", "#f0f", "#00f", "#0ff", "#0f0", "#ff0", "#f00"],
            cavs = content.find(".qc-colorpicker-color"),
            width = cavs.width(),
            height = cavs.height();

        var ctx = cavs[0].getContext("2d"),
            grad = ctx.createLinearGradient(1, 0, width - 1, 0),
            len = colors.length - 1;

        colors.each(function (color, i) {
            grad.addColorStop(i / len, color);
        });
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    },
    event: function (obj, fn) {
        obj.on("mousedown", function (ev) {
            var tar = qc(ev.target);
            if (tar.hasClass("qc-colorpicker-bar-pick") ||
                tar.hasClass("qc-colorpicker-bar-pick-a") ||
                tar.hasClass("qc-colorpicker-panel-pick") || tar.is("canvas")) {
                obj.tar = tar;
                fn(obj, ev.pageX, ev.pageY);

                qc(document).on("mousemove", mousemove, false);

                function mousemove(ev) {
                    fn(obj, ev.pageX, ev.pageY);
                    ev.preventDefault();
                }

                qc(document).on("mouseup mouseleave", mouseup, false);

                function mouseup(ev) {
                    qc(document).off("mousemove", mousemove, false);
                    qc(document).off("mouseup", mouseup, false);
                }
            }
        });
    },
    setPanelPickP: function (panel, pageX, pageY) {
        var pick = panel.find(".qc-colorpicker-panel-pick"),
            x = pageX - panel.offset().left,
            y = pageY - panel.offset().top,
            cavs = panel.find("canvas"),
            width = cavs[0].width,
            height = cavs[0].height,
            content = panel.closest("[qc-content]");

        x = Math.max(0, Math.min(x, width));
        y = Math.max(0, Math.min(y, height));

        var rgba = content[0].rgba;
        var bg = rgba.r >= 200 && rgba.g >= 200 && rgba.b >= 200 ? "#000" : "#fff";
        pick.css({
            "left": (x - pick.width() / 2) + "px",
            "top": (y - pick.height() / 2) + "px",
            "box-shadow": "0 0 2px 2px " + bg
        });

        var hsba = cavs[0].hsba;    // qc.colorpicker.rgba2hsba(cavs[0].hsba);console.log(hsba);
        hsba.s = x * 100 / width;
        hsba.b = 100 - y * 100 / height;
        hsba.a = rgba.a;
        content[0].rgba = qc.colorpicker.hsba2rgba(hsba);

        qc.colorpicker.setTextBox(content);
    },
    setBarPickP: function (bar, pageX, pageY) {
        var tar = bar.tar, isPickA = false, pick;
        if (tar.hasClass("qc-colorpicker-color") || tar.hasClass("qc-colorpicker-bar-pick")) {
            pick = bar.find(".qc-colorpicker-bar-pick");
        } else {
            pick = bar.find(".qc-colorpicker-bar-pick-a");
            isPickA = true;
        }

        var cavs = bar.find("canvas").eq(isPickA ? 1 : 0),
            x = pageX - bar.offset().left,
            width = cavs[0].width,
            content = bar.closest("[qc-content]");

        x = Math.max(cavs[0].offsetLeft, Math.min(x, width + cavs[0].offsetLeft));

        pick.css({
            "left": (x - pick.width() / 2) + "px"
        });

        if (isPickA) {
            var a = ((x - cavs[0].offsetLeft) / width).toFixed(2);
            if (a == 0) a = 0;
            if (a == 1) a = 1;
            content[0].rgba.a = a;
        } else {
            var hsba = qc.colorpicker.rgba2hsba(content[0].rgba);
            hsba.h = 360 - 360 * (x - cavs[0].offsetLeft) / width;
            // console.log(hsba, qc.colorpicker.hsba2rgba(hsba));
            content[0].rgba = qc.colorpicker.hsba2rgba(hsba);

            qc.colorpicker.drawPanel(content, hsba);
        }
        qc.colorpicker.setTextBox(content);
    },
    setBarPick: function (content) {
        var pick = content.find(".qc-colorpicker-bar-pick"),
            picka = content.find(".qc-colorpicker-bar-pick-a"),
            cavs = content.find(".qc-colorpicker-bar canvas"),
            width = cavs[0].width,
            offset = cavs[0].offsetLeft,
            hsba = qc.colorpicker.rgba2hsba(content[0].rgba),
            h = hsba.h,
            x = (360 - h) / 360 * width + offset - pick.width() / 2,
            xa = cavs[1].width / 255 * (hsba.a * 255) + offset - picka.width() / 2;

        qc.colorpicker.drawPanel(content, hsba);
        pick.css("left", x + "px");
        picka.css("left", xa + "px");
    },
    drawPanel: function (content, hsba) {
        var cavs = content.find(".qc-colorpicker-panel canvas"),
            ctx = cavs[0].getContext("2d"),
            width = cavs[0].width,
            height = cavs[0].height,
            color1 = "#fff";

        hsba.s = 100;
        hsba.b = 100;
        hsba.a = 1;

        var rgba = qc.colorpicker.hsba2rgba(hsba),
            color2 = qc.colorpicker.rgba2str(rgba);

        cavs[0].hsba = hsba;

        var grad1 = ctx.createLinearGradient(3, 0, width - 3, 0);
        grad1.addColorStop(0, color1);
        grad1.addColorStop(1, color2);
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        var grad2 = ctx.createLinearGradient(0, 3, 0, height - 3);
        grad2.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad2.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);

        var bara = content.find(".qc-colorpicker-a");
        var ctxa = bara[0].getContext("2d");
        ctxa.clearRect(0, 0, width, height);

        var grad3 = ctxa.createLinearGradient(1, 0, bara[0].width - 1, 0);
        var c1 = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", 0)",
            c2 = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", 1)";
        grad3.addColorStop(0, c1);
        grad3.addColorStop(1, c2);
        ctxa.fillStyle = grad3;
        ctxa.fillRect(0, 0, width, height);
    },
    setPanelPick: function (content) {
        var cavs = content.find(".qc-colorpicker-panel canvas"),
            pick = content.find(".qc-colorpicker-panel-pick"),
            width = cavs[0].width,
            height = cavs[0].height,
            rgba = content[0].rgba,
            hsba = qc.colorpicker.rgba2hsba(rgba);

        var x = parseInt(hsba.s * width / 100 - pick.width() / 2),
            y = parseInt((100 - hsba.b) * height / 100 - pick.height() / 2);

        pick.css({
            "left": x + "px",
            "top": y + "px",
            "box-shadow": "0 0 2px 2px " + (rgba.r >= 200 && rgba.g >= 200 && rgba.b >= 200 ? "#000" : "#fff")
        });
    },
    setTextBox: function (content) {
        var cur = content.find(".qc-colorpicker-cur"),
            hex = content.find(".qc-colorpicker-hex"),
            rgbs = content.find(".qc-colorpicker-rgb"),
            rgba = content[0].rgba;

        cur.css("background", qc.colorpicker.rgba2str(rgba));
        hex.val(qc.colorpicker.rgba2str(rgba, "hex"));
        var _rgba = [rgba.r, rgba.g, rgba.b];
        rgbs.each(function (i) {
            qc(this).val(_rgba[i]);
        });
        var a = 1;
        if (rgba.a == 0) a = 0;
        if (rgba.a == 1) a = 1;
        rgbs.eq(3).val(rgba.a );
    },
    str2rgba: function (str) {
        str = str.replace(/\s+/g, "");
        var rgba = {"r": 0, "g": 0, "b": 0, "a": 1},
            regs = [
                /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})?$/i,
                /^rgb\((\d{0,3}),(\d{0,3}),(\d{0,3})\)$/i,
                /^rgba\((\d{0,3}),(\d{0,3}),(\d{0,3}),([\d\.]+)\)$/i
            ];
        regs.each(function (reg, i) {
            var m = str.match(reg);
            if (m) {
                var rgb = [m[1], m[2], m[3]].map(function (x) {
                    return parseInt(i > 1 ? x : "0x" + (x.length == 1 ? x + x : x));
                });
                rgba.r = rgb[0];
                rgba.g = rgb[1];
                rgba.b = rgb[2];
                if (m[4]) {
                    rgba.a = i == 0 ?
                        parseFloat((parseInt("0x" + m[4]) / 255).toFixed(2)) : m[4];
                }
                return false;
            }
        });
        return rgba;
    },
    rgba2hsba: function (rgba) {
        var _r = rgba.r, _g = rgba.g, _b = rgba.b,
            h = 0, s = 0, b = 0;

        var min = Math.min(_r, _g, _b);
        var max = Math.max(_r, _g, _b);
        var delta = max - min;
        b = max;
        s = max != 0 ? 255 * delta / max : 0;

        if (s != 0) {
            if (_r == max) h = (_g - _b) / delta;
            else if (_g == max) h = 2 + (_b - _r) / delta;
            else h = 4 + (_r - _g) / delta;
        } else h = 0;
        h *= 60;
        if (h < 0) h += 360;
        s *= 100 / 255;
        b *= 100 / 255;
        return {"h": h, "s": s, "b": b, "a": rgba.a};
    },
    hsba2rgba: function (hsba) {
        var r, g, b;
        var h = Math.round(hsba.h);
        var s = Math.round(hsba.s * 255 / 100);
        var v = Math.round(hsba.b * 255 / 100);

        if (s == 0) {
            r = g = b = v;
        } else {
            var t1 = v;
            var t2 = (255 - s) * v / 255;
            var t3 = (t1 - t2) * (h % 60) / 60;

            if (h == 360) h = 0;

            if (h < 60) {
                r = t1;
                b = t2;
                g = t2 + t3
            } else if (h < 120) {
                g = t1;
                b = t2;
                r = t1 - t3
            } else if (h < 180) {
                g = t1;
                r = t2;
                b = t2 + t3
            } else if (h < 240) {
                b = t1;
                r = t2;
                g = t1 - t3
            } else if (h < 300) {
                b = t1;
                g = t2;
                r = t2 + t3
            } else if (h < 360) {
                r = t1;
                g = t2;
                b = t1 - t3
            } else {
                r = 0;
                g = 0;
                b = 0
            }
        }
        return {"r": Math.round(r), "g": Math.round(g), "b": Math.round(b), "a": hsba.a};
    },
    rgba2str: function (rgba, type) {
        var r = rgba.r, g = rgba.g, b = rgba.b, a = rgba.a;
        if (type == "hex") {
            var hex = "#" + [r, g, b].map(function (x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }).join("");
            if (a != 1) {
                hex += Math.round("0" + (a * 255)).toString(16).slice(-2);
            }
            return hex;
        } else {
            var rgb = [r, g, b].join(",");
            return a == 1 ? "rgb(" + rgb + ")" : "rgba(" + rgb + "," + a + ")";
        }
    },
    createList: function (content, origColor) {
        var rgb = qc.colorpicker.str2rgba(origColor);
        [
            ["#C00000", "#ff0000", "#FFC000", "#ffff00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"],
            ["#FFFFFF", "#000000", "#E7E6E6", "#44546A", "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5", "#70AD47"],
            ["#F2F2F2", "#7F7F7F", "#D0CECE", "#D5DCE4", "#D9E2F3", "#FBE4D5", "#EDEDED", "#FFF2CC", "#DEEAF6", "#E2EFD9"],
            ["#D9D9D9", "#595959", "#AEAAAA", "#ACB9CA", "#B4C6E7", "#F7CAAC", "#DBDBDB", "#FFE599", "#BDD6EE", "#C5E0B3"],
            ["#BFBFBF", "#404040", "#767171", "#8496B0", "#8EAADB", "#F4B083", "#C9C9C9", "#FFD966", "#9CC2E5", "#A8D08D"],
            ["#A6A6A6", "#262626", "#3B3838", "#323E4F", "#2F5496", "#C45911", "#7B7B7B", "#BF8F00", "#2E74B5", "#538135"],
            ["#808080", "#0D0D0D", "#171717", "#222A35", "#1F3864", "#833C0B", "#525252", "#806000", "#1F4E79", "#385623"]
        ].each(function (color, i) {
            var row = qc("<div class='qc-colorpicker-row'>");
            color.each(function (c, j) {
                var box = qc("<a href='javascript:void(0);' class='qc-colorpicker-box'>");
                box.css("background-color", c);
                var _rgb = qc.colorpicker.str2rgba(c);
                if (_rgb.r == rgb.r && _rgb.g == rgb.g && _rgb.b == rgb.b && rgb.a == 1) {
                    box.addClass("selected");
                }
                row.append(box);
                box.click(function () {
                    var obj = qc(this);
                    content.find(".qc-colorpicker-box").removeClass("selected");
                    obj.addClass("selected");
                });
            });
            content.append(row);
        });
    },
    item: function (obj) {
        var fnc = obj.curr.closest("[qc-content]")[0].callee;
        var bg = obj.curr.css("background-color");
        if (fnc && bg) {
            fnc(bg);
            qc.popfrm.dyHide(obj);
        }
    },
    confirm: function (obj) {
        var contrl = obj.contrl,
            origin = contrl[0].origin,
            fnc = contrl[0].callee,
            content = contrl.find("[qc-content]"),
            color;

        if (content[0].rgba) {
            color = qc.colorpicker.rgba2str(content[0].rgba);
        } else {
            color = content.find(".qc-colorpicker-box.selected").css("background-color");
        }

        if (fnc) {
            fnc(color);
        }
        qc.popfrm.hide(obj);
    }
};
