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
    var name = listener ? listener.name || function () {
        var reg = /^function\s*([^(\s]*)\s*\(/,
            m = listener.toString().match(reg);
        if (m)
            return m[1];
        return "";
    }() : "";

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
    return this;
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