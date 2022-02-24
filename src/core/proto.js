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
    var obj = this,
        type = type || "append";

    obj.each(function () {
        var ins = qc._convert(cont),
            el = this.nodeType == 9 ? this.body : this,
            refor = el;

        if (!ins[0])
            return true;

        if (type == "prepend") {
            refor = el.firstChild;
        } else if (type == "after") {
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
    if (str == undefined) {
        return el.innerHTML == undefined ? el.textContent : el.innerHTML;
    } else {
        this.each(function () {
            this.innerHTML == undefined ? this.textContent = str : this.innerHTML = str;
        });
        return this;
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
    if (str == undefined) {
        if (this[0].value != undefined)
            return this[0].value;
        else
            return null;
    } else {
        this.each(function () {
            if (this.value != undefined) {
                this.value = str;
            }
        });
        return this;
    }

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
        var el = this;
        if (el.nodeType == 1) {
            var display = qc(el).css("display");
            if (display != "none" && !el.display)
                el.display = qc(el).css("display");
            el.style.display = "none";
        }
    });
    return this;
};

qc.prototype.show = function () {
    this.each(function () {
        var el = this;
        if (el.nodeType == 1) {
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
        var nodes = this.contentDocument ? [this.contentDocument.documentElement] : this.childNodes;
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
