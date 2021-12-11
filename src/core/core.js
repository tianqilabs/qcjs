(function () {
    function QC(selector, context) {
        return new QC.init(selector, context);
    }

    QC.prototype = {
        constructor: QC,
        qcjs: "0.1.2"
    };

    QC.init = function (selector, context) {
        var doc = context || document, elems = [];

        this.length = 0;

        if (!selector) return this;

        function push(sel) {
            if (typeof sel == "string") {
                sel = sel.trim();

                if (/^<[\s\S]*>$/.exec(sel)) {
                    var tbEl = {
                        "tr": [2, "<table><tbody>", "</tbody></table>"],
                        "th": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                        "td": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                        "tbody": [1, "<table>", "</table>"],
                        "thead": [1, "<table>", "</table>"],
                        "tfoot": [1, "<table>", "</table>"],
                        "col": [2, "<table><colgroup>", "</colgroup><tbody></tbody></table>"],
                        "colgroup": [1, "<table>", "</table>"],
                        "option": [1, "<select>", "</select>"],
                        "": [0, "", ""]
                    };

                    var els = /^<\s*([^\s>]+)\s*[^>]*>/i.exec(sel);
                    if (els) {
                        var el = document.createElement("DIV");
                        var tb = tbEl[els[1]] || tbEl[""];
                        el.innerHTML = tb[1] + sel + tb[2];
                        var k = tb[0];
                        if (k > 0) {
                            while (k > 0) {
                                el = el.firstChild;
                                k--;
                            }
                        }
                        elems = el.childNodes;
                    }
                } else {
                    try {
                        elems = doc.querySelectorAll(sel);
                    } catch (e) {
                    }
                }
            } else if (sel && (sel.nodeType || sel.document)) {
                elems.push(sel);
            } else if (Object.prototype.toString.call(sel).contains("NodeList") || Array.isArray(sel)) {
                for (var i = 0; i < sel.length; i++) {
                    push(sel[i]);
                }
            } else if (sel.qcjs || sel.jquery) {
                sel.each(function () {
                    elems.push(this);
                });
            }
        }

        if (typeof selector == "function") {
            qc(doc).on("DOMContentLoaded", selector);
        } else {
            push(selector);
        }

        /*
        if (typeof selector == "string") {
            selector = selector.trim();
            if (/^<[\s\S]*>$/.exec(selector)) {
                var tbEl = {
                    "tr": [2, "<table><tbody>", "</tbody></table>"],
                    "th": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                    "td": [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                    "tbody": [1, "<table>", "</table>"],
                    "thead": [1, "<table>", "</table>"],
                    "tfoot": [1, "<table>", "</table>"],
                    "col": [2, "<table><colgroup>", "</colgroup><tbody></tbody></table>"],
                    "colgroup": [1, "<table>", "</table>"],
                    "option": [1, "<select>", "</select>"],
                    "": [0, "", ""]
                };

                var els = /^<\s*([^\s>]+)\s*[^>]*>/i.exec(selector);
                if (els) {
                    var el = document.createElement("DIV");
                    var tb = tbEl[els[1]] || tbEl[""];
                    el.innerHTML = tb[1] + selector + tb[2];
                    var k = tb[0];
                    if (k > 0) {
                        while (k > 0) {
                            el = el.firstChild;
                            k--;
                        }
                    }
                    elems = el.childNodes;
                }
            } else {
                try {
                    elems = doc.querySelectorAll(selector);
                } catch (e) {
                }
            }
        } else if (selector && (selector.nodeType || selector.document)) {
            elems.push(selector);
        } else if (typeof selector == "function") {
            qc(doc).on("DOMContentLoaded", selector);
        } else if (Object.prototype.toString.call(selector).contains("NodeList") ||
            Array.isArray(selector)) {

            for (var i = 0; i < selector.length; i++) {
                if (selector[i].nodeType) {
                    elems.push(selector[i]);

                } else if (selector[i].qcjs || selector[i].jquery) {
                    selector[i].each(function () {
                        elems.push(this);
                    });

                } else {
                    qc(selector[i]).each(function () {
                        elems.push(this);
                    });
                }
            }

        } else if (selector.qcjs || selector.jquery) {
            selector.each(function () {
                elems.push(this);
            });
        }

         */

        for (var i = 0; i < elems.length; i++) {
            this[i] = elems[i];
        }
        this.length = elems.length;

        return this;
    };

    QC.init.prototype = QC.prototype;

    window.qc = QC;
})();