/* ! qcjs (c) 老李 (20390965@qq.com) v0.2.0 */

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
                elems.push(selector[i]);
            }
        } else if (selector.qcjs) {
            return selector;
        } else if (selector.jquery) {
            selector.each(function () {
                elems.push(this);
            });
        }

        for (var i = 0; i < elems.length; i++) {
            this[i] = elems[i];
        }
        this.length = elems.length;

        return this;
    };

    QC.init.prototype = QC.prototype;

    window.qc = QC;
})();
qc._indexOf = function (obj, search, index) {
    var idx = 0;
    if (index)
        idx = index < 0 ? obj.length + index : index;

    for (;idx < obj.length; idx++) {
        var _obj = obj[idx];
        if (qc._equals(_obj, search)) {
            return idx;
        }
    }
    return -1;
};

qc._equals = function (obj1, obj2) {
    var type1, type2, re = false;
    if (obj1) {
        if (Array.isArray(obj1)) type1 = "array";
        else if (obj1.qcjs) type1 = "qc";
        else if (obj1.qcset) type1 = "qcset";
    }

    if (obj2) {
        if (Array.isArray(obj2)) type2 = "array";
        else if (obj2.qcjs) type2 = "qc";
        else if (obj2.qcset) type2 = "qcset";
    }

    if (type1 && type1 == type2) {
        if (obj1.length == obj2.length) {
            qc._each(obj1, function (arr, idx, arrs) {
                re = qc._equals(arr, obj2[idx]);
                if (!re) return false;
            });
        }
    } else
        re = obj1 == obj2;

    return re;
};

qc._each = function (obj, callback) {
    for (var i = 0; i < obj.length; i++) {
        var _obj = obj[i];
        if (callback(_obj, i, obj) == false)
            break;
    }
};

qc._extend = function () {
    var obj = arguments[0] || {};
    if (typeof obj != "object") {
        obj = {};
    }
    for (var i = 1; i < arguments.length; i++) {
        var _obj = arguments[i];
        if (typeof _obj == "object") {
            for (var k in _obj) {
                if (_obj[k] != undefined)
                    obj[k] = _obj[k];
            }
        }
    }
    return obj;
};

qc._convert = function (cont) {
    if (typeof cont == "string") {
        if (cont.charAt(0) == "<" && cont.charAt(cont.length - 1) == ">")
            return qc(cont);
        else
            return qc("<span>" + cont + "</span>").contents();
    } else {
        return qc(cont);
    }
};

qc._matches = function (el, str) {
    var matches = el.matchesSelector ||
        el.mozMatchesSelector ||
        el.msMatchesSelector ||
        el.oMatchesSelector ||
        el.webkitMatchesSelector ||
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {
            }
            return i > -1;
        };
    return matches.call(el, str);
};

qc._ajax = function (url, settings) {
    if (!url) return;

    var opts = {
        "type": "get",
        "data": {},
        "progress": null,
        "error": null,
        "success": null
    };
    opts = qc._extend(opts, settings);

    if (opts.type.toLowerCase() == "post") {
        var hasFile;
        for (var k in opts.data) {
            var v = opts.data[k];
            if (v == undefined) continue;
            if (v["type"] && v.type.toLowerCase() == "file") {
                hasFile = true;
                break;
            }
        }
        if (hasFile) {
            if (typeof FormData == "undefined") {
                qc._postIE(url, opts.data, opts.success);
            } else {
                qc._postUpload(url, opts.data, opts.success, opts.progress, opts.error);
            }
        } else {
            qc._postData(opts.type, url, opts.data, opts.success);
        }

    } else {
        qc._postData(opts.type, url, opts.data, opts.success);
    }
};

qc._postIE = function (url, data, callback) {
    var name = "qc_ajax_" + Date.now().toString(16);

    var box = qc("<div  style='height: 100px; width: 100px; display: block;' id='" + name + "_box'>");
    qc("body").append(box);

    var iframe = qc("<iframe name='" + name + "'>");
    box.append(iframe);

    iframe.on("load", function () {
        if (callback) callback(this.contentDocument.documentElement.innerText);
        box.remove();
    });

    var form = qc("<form target='" + name + "' action='" + url +
        "'method='post' enctype='multipart/form-data'>");

    box.append(form);

    for (var k in data) {
        var v = data[k];
        if (v == undefined) continue;

        if (Array.isArray(v)) {
            v.each(function (arr) {
                form.append("<input type='hidden' name='" + k + "' value='" + arr + "'>");
            });
        } else if (v["type"] && v.type.toLowerCase() == "file") {
            form.append(v.cloneNode());
        } else {
            form.append("<input type='hidden' name='" + k + "' value='" + arr + "'>");
        }
    }
    form.submit();
};

qc._postUpload = function (url, data, success, progress, error) {
    var xhr = new XMLHttpRequest();
    url += (url.match(/\?/) == null ? "?" : "&") + (new Date()).getTime();

    xhr.addEventListener("progress", function (e) {
        if (progress) progress(e);
    });
    xhr.addEventListener("error", function (e) {
        if (error) error(e);
    });
    xhr.addEventListener("load", function (e) {
        if (success) success(xhr.responseText);
    });

    var formData = new FormData();
    for (var k in data) {
        var v = data[k];
        if (v == undefined) continue;
        if (Array.isArray(v)) {
            v.each(function (arr) {
                formData.append(k, v);
            });
        } else if (v["type"] && v.type.toLowerCase() == "file") {
            for (var i = 0; i < v.files.length; i++) {
                formData.append(k, v.files[i], v.files[i].name);
            }
        } else {
            formData.append(k, v);
        }
    }

    xhr.open("post", url);
    xhr.send(formData);
};

qc._postData = function (type, url, data, callback) {
    var xhr = new XMLHttpRequest();
    // url += (url.match(/\?/) == null ? "?" : "&") + (new Date()).getTime();

    xhr.addEventListener("load", function (e) {
        if (callback) callback(xhr.responseText);
    });

    var parms = [];
    for (var k in data) {
        var v = data[k];
        if (v == undefined) continue;
        if (Array.isArray(v)) {
            v.each(function (arr) {
                parms.push(k + "=" + encodeURI(encodeURI(arr)));
            });
        } else {
            parms.push(k + "=" + encodeURI(encodeURI(v)));
        }
    }

    type = type.toLowerCase();

    var data = null;
    if (type == "post") {
        data = parms.join("&");
    } else {
        if (parms.length > 0)
            url += (url.lastIndexOf("?") == -1 ? "?" : "&") + parms.join("&");
    }

    xhr.open(type, url);
    if (type == "post")
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);
};

qc._post = function (url, data, callback) {
    var opts = {
        "type": "post",
        "data": data,
        "success": callback
    };
    qc._ajax(url, opts);
};

qc._get = function (url, data, callback) {
    var opts = {
        "type": "get",
        "data": data,
        "success": callback
    };
    qc._ajax(url, opts);
};

qc.getScript = function (url, doc, callee) {
    if (typeof doc == "function") {
        callee = doc;
        doc = null;
    }
    if (!doc || (doc.nodeType && doc.nodeType != 9))
        doc = document;

    var el = qc(doc.createElement("script"));
    if (callee) {
        el[0].onload = function (ev) {
            callee("success", ev);
        };
        el[0].onerror = function (ev) {
            callee("error", ev);
        };
    }
    qc(doc).find("head").append(el);
    el[0].src = url;
    return el;
};


if (!String.prototype.contains) {
    String.prototype.contains = function (str) {
        return this.indexOf(str) != -1;
    };
}
if (!Array.prototype.contains) {
    Array.prototype.contains = function (arg) {
        return this.indexOf(arg) != -1;
    };
}
if (!Array.prototype.each) {
    Array.prototype.each = function (callback) {
        qc._each(this, callback);
    };
}
if (!Array.prototype.equals) {
    Array.prototype.equals = function (arg) {
        return qc._equals(this, arg);
    };
}

if (!String.prototype.contains) {
    String.prototype.contains = function (str) {
        return this.indexOf(str) != -1;
    };
}

(function () {
    function QCSet(cont) {
        return new QCSet.prototype.init(cont);
    }

    QCSet.prototype = {
        constructor: QCSet,
        qcset: "1"
    };

    QCSet.prototype.init = function (cont) {
        this.length = 0;
        var objs = [];
        if (typeof cont == "string") {
            cont.split(",").each(function (arr) {
                objs.push(arr.trim());
            });
        } else {
            objs = cont ? cont : [];
        }
        for (var i = 0; i < objs.length; i++) {
            this.add(objs[i]);
        }
        return this;
    };

    QCSet.prototype.init.prototype = QCSet.prototype;

    window.QCSet = QCSet;
})();

QCSet.prototype.indexOf = function (arg, index) {
    return qc._indexOf(this, arg, index);
};
QCSet.prototype.contains = function (arg) {
    return this.indexOf(arg) != -1;
};
QCSet.prototype.add = function () {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!this.contains(arg)) {
            this[this.length] = arg;
            this.length++;
        }
    }
    return this;
};
QCSet.prototype.remove = function () {
    var qcs = this, clone = [];
    this.each(function (s, i) {
        clone.push(s);
        delete qcs[i];
    });
    qcs.length = 0;
    for (var i = 0; i < arguments.length; i++) {
        var idx = clone.indexOf(arguments[i]);
        if (idx != -1) {
            clone.splice(idx, 1);
        }
    }
    clone.each(function (arr) {
        qcs.add(arr);
    });
    return qcs;
};
QCSet.prototype.each = function (callback) {
    qc._each(this, callback);
};
QCSet.prototype.merge = function (arg) {
    var obj = this;
    arg.each(function (s) {
        obj.add(s);
    });
    return this;
};
QCSet.prototype.join = function (split) {
    var data = [];
    this.each(function (s) {
        data.push(s)
    });
    return data.join(split);
};
QCSet.prototype.equals = function (obj) {
    return qc._equals(this, obj);
};

qc.prototype.equals = function (obj2) {
    return qc._equals(this, obj2);
};

qc.prototype.each = function (callback) {
    qc._each(this, function (arr, idx, arrs) {
        return callback.call(arr, idx, arrs);
    });
};

// manipulation
qc.prototype.insert = function (cont, type) {
    var obj = this, ins = qc._convert(cont), type = type || "append";
    if (ins.length > 0) {
        obj.each(function () {
            var el = this.nodeType == 9 ? this.body : this;
            var refor = el;
            if (type == "prepend")
                refor = el.firstChild;
            else if (type == "after") {
                refor = el.nextSibling;
            }

            ins.each(function () {
                var inEl = this;
                if (type == "append") {
                    el.appendChild(inEl);
                } else if (type == "prepend") {
                    el.insertBefore(inEl, refor);
                } else if (type == "before") {
                    el.parentNode.insertBefore(inEl, refor);
                } else if (type == "after") {
                    el.parentNode.insertBefore(inEl, refor);
                }
            });
        });
    }
    return obj;
};

qc.prototype.append = function (cont) {
    if (cont) {
        this.insert(cont, "append");
    }
    return this;
};

qc.prototype.prepend = function (cont) {
    if (cont) {
        this.insert(cont, "prepend");
    }
    return this;
};

qc.prototype.before = function (cont) {
    if (cont) {
        this.insert(cont, "before");
    }
    return this;
};

qc.prototype.after = function (cont) {
    if (cont) {
        this.insert(cont, "after");
    }
    return this;
};

qc.prototype.remove = function () {
    this.each(function () {
        var par = this.parentNode;
        if (par)
            par.removeChild(this);
    });
    return this;
};

qc.prototype.clone = function () {
    return qc(this[0].cloneNode(true));
};

qc.prototype.empty = function () {
    this.each(function () {
        qc(this.childNodes).remove();
    });
    return this;
};

qc.prototype.attr = function (name, value) {
    if (value == undefined) {
        return this[0].getAttribute(name);
    } else {
        this.each(function () {
            this.setAttribute(name, value);
        });
        return this;
    }
};

qc.prototype.removeAttr = function (name) {
    if (this.length > 0) {
        var el = this[0], atts = [];
        if (name == undefined) {
            atts = el.getAttributeNames();
        } else {
            name.split(" ").each(function (n) {
                atts.push(n);
            });
        }
        atts.each(function (n) {
            el.removeAttribute(n);
        });
    }
    return this;
};

qc.prototype.html = function (str) {
    var el = this[0];
    if (str != undefined) {
        el.innerHTML == undefined ? el.textContent = str : el.innerHTML = str;
        return this;
    } else {
        return el.innerHTML == undefined ? el.textContent : el.innerHTML;
    }
};

qc.prototype.text = function (str) {
    var el = this[0];
    if (str != undefined) {
        el.innerText = str;
        return this;
    } else {
        return el.innerText;
    }
};

qc.prototype.css = function (name, value) {
    var objs = this;

    var cssObj = name || {};
    if (typeof cssObj == "string")
        cssObj = {};

    if (typeof name == "string") {
        if (value == undefined) {
            var el = objs[0];
            var win = el.defaultView || el.ownerDocument.defaultView || window,
                css = win.getComputedStyle(el, null);
            name = name.replace(/-([a-z])/g, function (keb, item) {
                return item.toUpperCase();
            });
            var _css = css ? css[name] : "";
            var r = /^(.*)(rgba?\(.+\))(.*)$/.exec(_css);
            if (r) {
                var d = r[2].match(/([\d\.]+)/g);
                if (d) {
                    var rgb = [d[0], d[1], d[2]];
                    if (d.length == 4) {
                        rgb.push(Math.round(d[3] * 255));
                    }
                }
                _css = r[1] + "#" + rgb.map(function (x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }).join("") + r[3];
            }
            return _css;
        } else
            cssObj[name] = value;
    }

    objs.each(function () {
        var el = this;
        for (var n in cssObj) {
            var v = cssObj[n];
            n = n.replace(/-([a-z])/g, function (keb, item) {
                return item.toUpperCase();
            });
            el.style[n] = v;
            if (el.style.cssText.length == 0)
                el.removeAttribute("style");
        }
    });

    return objs;
};

qc.prototype.val = function (str) {
    var el = this[0];
    if (el.value != undefined) {
        if (str == undefined) {
            return el.value;
        } else {
            el.value = str;
        }
    }
    return this;
};

qc.prototype.width = function (num) {
    if (num != undefined)
        this.css("width", num + "px");
    else {
        if (this[0] == window)
            return this[0].innerWidth;
        else
            return this[0].clientWidth;
    }
    return this;
};

qc.prototype.height = function (num) {
    if (num != undefined)
        this.css("height", num + "px");
    else {
        if (this[0] == window)
            return this[0].innerHeight;
        else
        return this[0].clientHeight;
    }
    return this;
};

qc.prototype.outerWidth = function () {
    return this[0].offsetWidth;
};

qc.prototype.outerHeight = function () {
    return this[0].offsetHeight;
};

qc.prototype.offset = function () {
    var el = this[0];
    var doc = el.ownerDocument,
        docEl = doc.documentElement,
        win = doc.defaultView,
        rect = el.getBoundingClientRect();
    return {
        left: rect.left + win.pageXOffset - docEl.clientLeft,
        top: rect.top + win.pageYOffset - docEl.clientTop
    };
};

qc.prototype.position = function () {
    var el = this[0];
    return {
        left: el.offsetLeft,
        top: el.offsetTop
    } ;
};

qc.prototype.scrollTop = function (num) {
    if (num != undefined) {
        this[0].scrollTop = num;
    } else {
        return this[0].scrollTop;
    }
    return this;
};

qc.prototype.scrollLeft = function (num) {
    if (num != undefined) {
        this[0].scrollLeft = num;
    } else {
        return this[0].scrollLeft;
    }
    return this;
};

qc.prototype.hide = function () {
    this.each(function () {
        var el = this,
            display = qc(el).css("display");
        if (display != "none" && !el.display)
            el.display = qc(el).css("display");
        el.style.display = "none";
    });
    return this;
};

qc.prototype.show = function () {
    this.each(function () {
        var el = this;
        var display = qc(el).css("display");
        if (display == "none") {
            if (!qc.displays) {
                qc.displays = {};
            }
            var tagn = el.tagName;
            display = el.display || qc.displays[tagn];
            if (!display) {
                var iframe = document.createElement("IFRAME");
                document.body.appendChild(iframe);
                var doc = iframe.document || iframe.contentDocument;
                var tmp = doc.createElement(tagn);
                if (doc.body) {
                    doc.body.appendChild(tmp);
                } else {
                    doc.appendChild(tmp);
                }
                display = qc(tmp).css("display");
                document.body.removeChild(iframe);
                qc.displays[tagn] = display;
            }
            el.style.display = display;
        }
    });
    return this;
};

qc.prototype.addClass = function (name) {
    var names = QCSet(name.split(" "));
    this.each(function () {
        var el = this;
        var cn = el.className, cns;
        if (cn) {
            cns = QCSet(cn.split(" "));
        } else {
            cns = QCSet();
        }
        cns.merge(names);
        el.className = cns.join(" ");
    });
    return this;
};

qc.prototype.hasClass = function (name) {
    var names = QCSet(name.split(" ")),
        cn = this[0].className,
        cns = cn.split(" "),
        re = true;
    names.each(function (n) {
        re = re && cns.contains(n);
    });
    return re;
};

qc.prototype.removeClass = function (name) {
    var conts = QCSet(name.split(" "));
    this.each(function () {
        var el = this;
        var cns = QCSet(el.className.split(" "));
        conts.each(function (con) {
            cns.remove(con);
        });
        el.className = cns.join(" ");
    });
    return this;
};

qc.prototype.isHide = function () {
    return this.css("display") == "none";
};

qc.prototype.isShow = function () {
    return !this.isHide();
};

// traversing
qc.prototype.first = function () {
    return qc(this[0]);
};

qc.prototype.last = function () {
    return qc(this[this.length - 1]);
};

qc.prototype.move = function (dir, selector, once) {
    var dirs = ["next", "prev", "parent", "closest"];
    if (!dir || !dirs.contains(dir)) dir = "next";

    var closest = dir == "closest";
    if (closest) once = false;

    var objs = this, elems = [];
    objs.each(function () {
        var el = this;
        while (el) {
            if (dir == "prev") {
                el = el.previousSibling;
            } else if (dir == "parent") {
                el = el.parentNode;
            } else if (dir == "next") {
                el = el.nextSibling;
            }
            if (el && el.nodeType == 1) {
                if (selector) {
                    if (qc(el).is(selector)) {
                        elems.push(el);
                    }
                } else {
                    elems.push(el);
                }
                if (once || (closest && elems.length > 0))
                    break;
            }
            if (closest) {
                el = el.parentNode;
            }
        }
    });

    return qc(elems);
};

qc.prototype.prev = function (selector) {
    return this.move("prev", selector, 1);
};

qc.prototype.prevAll = function (selector) {
    return this.move("prev", selector);
};

qc.prototype.next = function (selector) {
    return this.move("next", selector, 1);
};

qc.prototype.nextAll = function (selector) {
    return this.move("next", selector);
};

qc.prototype.parent = function (selector) {
    return this.move("parent", selector, 1);
};

qc.prototype.parents = function (selector) {
    return this.move("parent", selector);
};

qc.prototype.closest = function (selector) {
    if (selector)
        return this.move("closest", selector);
    else
        return qc();
};

qc.prototype.filter = function (selector) {
    var objs = this, elems = [];
    this.each(function () {
        var el = this;
        if (qc(el).is(selector)) {
            elems.push(el);
        }
    });
    return qc(elems);
};

qc.prototype.contents = function (selector) {
    var objs = this, elems = [];
    objs.each(function () {
        var nodes =  this.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!selector || (selector && qc(node).is(selector)))
                elems.push(node);
        }
    });
    return qc(elems);
};

qc.prototype.eq = function (index) {
    return qc(this[index]);
};

qc.prototype.find = function (selector) {
    var objs = this, elems = [];
    objs.each(function () {
        var nodes = this.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            elems.push(nodes[i]);
        }
    });
    return qc(elems);
};

qc.prototype.iframe = function (selector) {
    var doc = this[0].ownerDocument ? this[0].ownerDocument : this[0],
        iframe = doc.defaultView.frameElement;
    if (selector) {
        return qc(doc).find("iframe").filter(selector);
    }
    return qc(iframe);
};

qc.prototype.is = function (selector) {
    var re = false;
    this.each(function () {
        var el = this;
        re = re || qc._matches(el, selector);
    });
    return re;
};

qc.prototype.index = function () {
    return this.indexAll(true);
};

qc.prototype.indexAll = function (isEl) {
    var el = this[0], i = -1;
    while (el) {
        if (el && (!isEl || (isEl && el.nodeType == 1))) {
            i++;
        }
        el = el.previousSibling;
    }
    return i;
};

// events
qc._ons = function (el, type, name, fn) {
    var _on = el["qcon"] ? el["qcon"] : el["qcon"] = {};
    var _ev = _on[type] ? _on[type] : _on[type] = {};
    if (name) {
        if (fn) {
            _ev[name] = fn;
        } else {
            return _ev[name];
        }
    } else {
        return _ev;
    }
};

qc._event = function (el, ev, callback) {
    if (callback.call(el, ev) == false) {
        ev.stopPropagation();
    }
};

qc.prototype.on = function (event, listener, capture) {
    var name = listener.name || function () {
        var reg = /^function ([^\(\s]*)\s*\(/,
            m = listener.toString().match(reg);
        if (m)
            return m[1];
        return "";
    }();

    var events = QCSet(event.split(" "));
    this.each(function () {
        var el = this;
        events.each(function (evt) {
            if (!evt) return true;
            var fn = function (ev) {
                qc._event(el, ev, listener);
            };
            qc._ons(el, evt, name, fn);
            if (!capture) capture = false;
            el.addEventListener(evt, fn, capture);
        });
    });
    return this;
};

qc.prototype.off = function (event, listener) {
    var name = listener.name || function () {
        var reg = /^function ([^\(\s]*)\s*\(/,
            m = listener.toString().match(reg);
        if (m)
            return m[1];
        return "";
    }();

    var events = QCSet(event.split(" "));
    this.each(function () {
        var el = this;
        events.each(function (evt) {
            var fns = [];
            if (listener) {
                fns.push(qc._ons(el, evt, name));
            } else {
                var evts = qc._ons(el, evt);
                for (var k in evts) {
                    fns.push(evts[k]);
                }
            }
            fns.each(function (fn) {
                el.removeEventListener(evt, fn);
            });
        });
    });
};

qc.prototype.bind = function (event, callback) {
    var events = event.split(" ");
    this.each(function () {
        var el = this;
        events.each(function (evt) {
            el["on" + evt] = function (ev) {
                qc._event(el, ev, callback);
            };
        });
    });
    return this;
};

qc.prototype.unbind = function (event) {
    var events = event.split(" ");
    this.each(function () {
        var el = this;
        events.each(function (evt) {
            el["on" + evt] = null;
        });
    });
    return this;
};

qc._events = function () {
    ["blur", "focus", "focusin", "focusout", "resize", "scroll", "click", "dblclick",
        "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave",
        "change", "select", "submit", "keydown", "keypress", "keyup", "contextmenu", "load"].each(function (evt) {
        qc.prototype[evt] = function (callback) {
            if (callback)
                this.bind(evt, callback);
            else {
                var el = this[0];
                if (el[evt] && typeof el[evt] == "function")
                    el[evt]();
                else {
                    var ev = document.createEvent("Events");
                    ev.initEvent(evt, true, true);
                    el.dispatchEvent(ev);
                }
            }
        }
    });
};

qc._events();