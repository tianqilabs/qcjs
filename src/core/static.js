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

