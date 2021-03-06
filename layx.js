/*
 * file : layx.js
 * gitee : https://gitee.com/monksoul/LayX
 * author : 百小僧/MonkSoul
 * version : v2.1.1
 * create time : 2018.05.11
 * update time : 2018.05.22
 */

"use strict";
;
!(function (over, win, slf) {
    var Layx = {
        version: '2.1.1',
        defaults: {
            id: '',
            icon: true,
            title: '',
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            position: 'ct',
            storeStatus: true,
            control: true,
            style: '',
            controlStyle: '',
            bgColor: "#fff",
            shadow: true,
            border: "1px solid #3baced",
            type: 'html',
            frames: [],
            frameIndex: 0,
            content: '',
            cloneElementContent: true,
            url: '',
            useFrameTitle: false,
            opacity: 1,
            shadable: false,
            loaddingText: '内容正在加载中，请稍后',
            isOverToMax: true,
            stickMenu: false,
            stickable: true,
            minMenu: true,
            minable: true,
            maxMenu: true,
            maxable: true,
            closeMenu: true,
            closable: true,
            restorable: true,
            resizable: true,
            autodestroy: false,
            autodestroyText: '<div style="padding: 0 8px; ">此窗口将在 <strong>{second}</strong> 秒内自动关闭.</div>',
            resizeLimit: {
                t: false,
                r: false,
                b: false,
                l: false,
                lt: false,
                rt: false,
                lb: false,
                rb: false
            },
            buttons: [],
            isPrompt: false,
            movable: true,
            moveLimit: {
                vertical: false,
                horizontal: false,
                leftOut: true,
                rightOut: true,
                topOut: true,
                bottomOut: true
            },
            focusable: true,
            alwaysOnTop: false,
            allowControlDbclick: true,
            statusBar: false,
            statusBarStyle: '',
            event: {
                onload: {
                    before: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                },
                onmin: {
                    before: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                },
                onmax: {
                    before: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                },
                onrestore: {
                    before: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                },
                ondestroy: {
                    before: function (layxWindow, winform) { },
                    after: function () { }
                },
                onmove: {
                    before: function (layxWindow, winform) { },
                    progress: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                },
                onresize: {
                    before: function (layxWindow, winform) { },
                    progress: function (layxWindow, winform) { },
                    after: function (layxWindow, winform) { }
                }
            }
        },
        defaultButtons: {
            label: '确定',
            callback: function (id) { }
        },
        defaultFrames: {
            id: '',
            title: '',
            type: 'html',
            url: '',
            content: '',
            useFrameTitle: false,
            cloneElementContent: true
        },
        zIndex: 10000000,
        windows: {},
        stickZIndex: 20000000,
        create: function (options) {
            var that = this,
                config = layxDeepClone({}, that.defaults, options || {}),
                winform = {};
            if (!config.id) {
                console.error("窗口id不能为空且唯一");
                return;
            }
            ;
            var _winform = that.windows[config.id];
            if (_winform) {
                if (_winform.status === "min") {
                    that.restore(_winform.id);
                }
                that.flicker(config.id);
                return _winform;
            }
            if (Utils.isArray(config.frames)) {
                for (var i = 0; i < config.frames.length; i++) {
                    config.frames[i] = layxDeepClone({}, that.defaultFrames, config.frames[i]);
                    if (!config.frames[i].id) {
                        console.error("窗口组窗口id不能为空且窗口组内唯一");
                        return;
                    }
                }
            }
            if (Utils.isArray(config.buttons)) {
                for (var i = 0; i < config.buttons.length; i++) {
                    config.buttons[i] = layxDeepClone({}, that.defaultButtons, config.buttons[i]);
                }
            }
            if (config.shadable === true) {
                var layxShade = document.createElement("div");
                layxShade.setAttribute("id", "layx-" + config.id + "-shade");
                layxShade.classList.add("layx-shade");
                layxShade.style.zIndex = config.alwaysOnTop === true ? (++that.stickZIndex) : (++that.zIndex);
                document.body.appendChild(layxShade);
                layxShade.onclick = function (e) {
                    e = e || window.event;
                    that.flicker(config.id);
                    e.stopPropagation();
                };
            }
            if (config.style) {
                var style = document.getElementById("layx-style");
                if (style) {
                    style.innerHTML += config.style;
                } else {
                    style = document.createElement("style");
                    style.setAttribute("id", "layx-style");
                    style.type = "text/css";
                    style.innerHTML = config.style;
                    document.getElementsByTagName("HEAD").item(0).appendChild(style);
                }
            }
            var layxWindow = document.createElement("div");
            layxWindow.setAttribute("id", "layx-" + config.id);
            layxWindow.classList.add("layx-window");
            layxWindow.classList.add("layx-flexbox");
            if (config.shadow === true) {
                layxWindow.style.setProperty("box-shadow", "1px 1px 24px rgba(0, 0, 0, .3)");
                layxWindow.style.setProperty("-moz-box-shadow", "1px 1px 24px rgba(0, 0, 0, .3)");
                layxWindow.style.setProperty("-webkit-box-shadow", "1px 1px 24px rgba(0, 0, 0, .3)");
            }
            var _minWidth,
                _minHeight,
                _width,
                _height,
                _top,
                _left;
            _minWidth = Utils.compileLayxWidthOrHeight("width", config.minWidth, that.defaults.minWidth);
            _minHeight = Utils.compileLayxWidthOrHeight("height", config.minHeight, that.defaults.minHeight);
            _width = Utils.compileLayxWidthOrHeight("width", config.width, that.defaults.width);
            _height = Utils.compileLayxWidthOrHeight("height", config.height, that.defaults.height);
            var _position = Utils.compileLayxPosition(_width, _height, config.position);
            _top = _position.top;
            _left = _position.left;
            _width = Math.max(_width, _minWidth);
            _height = Math.max(_height, _minHeight);
            if (config.storeStatus === true) {
                var _areaInfo = that.getStoreWindowAreaInfo(config.id);
                if (_areaInfo) {
                    _width = _areaInfo.width;
                    _height = _areaInfo.height;
                    _top = _areaInfo.top;
                    _left = _areaInfo.left;
                } else {
                    that.storeWindowAreaInfo(config.id, {
                        width: _width,
                        height: _height,
                        top: _top,
                        left: _left
                    });
                }
            } else {
                that.removeStoreWindowAreaInfo(config.id);
            }
            layxWindow.style.zIndex = config.alwaysOnTop === true ? (++that.stickZIndex) : (++that.zIndex);
            layxWindow.style.width = _width + "px";
            layxWindow.style.height = _height + "px";
            layxWindow.style.minWidth = _minWidth + "px";
            layxWindow.style.minHeight = _minHeight + "px";
            layxWindow.style.top = _top + "px";
            layxWindow.style.left = _left + "px";
            if (config.border !== false) {
                layxWindow.style.setProperty("border", config.border === true ? '1px solid #3baced' : config.border);
            }
            layxWindow.style.backgroundColor = config.bgColor;
            layxWindow.style.opacity = Utils.isNumber(config.opacity) ? config.opacity : 1;
            if (config.type === "html" || config.type === "group") {
                layxWindow.onclick = function (e) {
                    e = e || window.event;
                    that.updateZIndex(config.id);
                    e.stopPropagation();
                };
            }
            document.body.appendChild(layxWindow);
            winform.id = config.id;
            winform.title = config.title;
            winform.windowId = layxWindow.getAttribute("id");
            winform.window = layxWindow;
            winform.createDate = new Date();
            winform.status = "normal";
            winform.type = config.type;
            winform.buttons = config.buttons;
            winform.frames = config.frames;
            winform.useFrameTitle = config.useFrameTitle;
            winform.cloneElementContent = config.cloneElementContent;
            winform.storeStatus = config.storeStatus;
            winform.groupCurrentId = (Utils.isArray(config.frames) && config.frames.length > 0 && config.frames[config.frameIndex]) ? config.frames[config.frameIndex].id : null;
            winform.area = {
                width: _width,
                height: _height,
                minWidth: _minWidth,
                minHeight: _minHeight,
                top: _top,
                left: _left
            };
            winform.loaddingText = config.loaddingText;
            winform.focusable = config.focusable;
            winform.isStick = config.alwaysOnTop === true;
            winform.zIndex = config.alwaysOnTop === true ? that.stickZIndex : that.zIndex;
            winform.movable = config.movable;
            winform.moveLimit = config.moveLimit;
            winform.resizable = config.resizable;
            winform.resizeLimit = config.resizeLimit;
            winform.stickable = config.stickable;
            winform.minable = config.minable;
            winform.maxable = config.maxable;
            winform.restorable = config.restorable;
            winform.closable = config.closable;
            winform.event = config.event;
            if (config.control === true) {
                var controlBar = document.createElement("div");
                controlBar.classList.add("layx-control-bar");
                controlBar.classList.add("layx-flexbox");
                config.controlStyle && controlBar.setAttribute("style", config.controlStyle);
                if (config.type === "group") {
                    controlBar.classList.add("layx-type-group");
                }
                layxWindow.appendChild(controlBar);
                if (config.icon !== false) {
                    var leftBar = document.createElement("div");
                    leftBar.classList.add("layx-left-bar");
                    leftBar.classList.add("layx-flexbox");
                    leftBar.classList.add("layx-flex-vertical");
                    controlBar.appendChild(leftBar);
                    var windowIcon = document.createElement("div");
                    windowIcon.classList.add("layx-icon");
                    windowIcon.classList.add("layx-window-icon");
                    windowIcon.innerHTML = config.icon === true ? '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-default-icon"></use></svg>' : config.icon;
                    leftBar.appendChild(windowIcon);
                }
                var title = document.createElement("div");
                title.classList.add("layx-title");
                title.classList.add("layx-flexauto");
                title.classList.add("layx-flexbox");
                if (config.type === "group") {
                    title.classList.add("layx-type-group");
                }
                if (config.allowControlDbclick === true) {
                    title.ondblclick = function (e) {
                        e = e || window.event;
                        if (config.restorable === true) {
                            that.restore(config.id);
                        }
                        e.stopPropagation();
                    };
                }
                if (config.movable === true) {
                    new LayxDrag(title);
                }
                controlBar.appendChild(title);
                if (config.type !== "group") {
                    var label = document.createElement("label");
                    label.innerHTML = config.title;
                    title.setAttribute("title", label.innerText);
                    title.appendChild(label);
                } else {
                    if (Utils.isArray(config.frames)) {
                        for (var i = 0; i < config.frames.length; i++) {
                            var frameConfig = layxDeepClone({}, that.defaultFrames, config.frames[i]);
                            var frameTitle = document.createElement("div");
                            frameTitle.setAttribute("data-frameId", frameConfig.id);
                            frameTitle.classList.add("layx-group-title");
                            if (i === config.frameIndex) {
                                frameTitle.setAttribute("data-enable", "1");
                            }
                            frameTitle.onclick = function (e) {
                                e = e || window.event;
                                var prevSelectTitle = layxWindow.querySelector(".layx-group-title[data-enable='1']");
                                if (prevSelectTitle !== this) {
                                    prevSelectTitle.removeAttribute("data-enable");
                                    this.setAttribute("data-enable", "1");
                                    that._setGroupIndex(config.id, this);
                                }
                                e.stopPropagation();
                            };
                            title.appendChild(frameTitle);
                            var groupLabel = document.createElement("label");
                            groupLabel.innerHTML = frameConfig.title;
                            frameTitle.setAttribute("title", groupLabel.innerText);
                            frameTitle.appendChild(groupLabel);
                        }
                    }
                }
                var rightBar = document.createElement("div");
                rightBar.classList.add("layx-right-bar");
                rightBar.classList.add("layx-flexbox");
                controlBar.appendChild(rightBar);
                var customMenu = document.createElement("div");
                customMenu.classList.add("layx-custom-menus");
                customMenu.classList.add("layx-flexbox");
                rightBar.appendChild(customMenu);
                if (config.stickMenu === true || config.minMenu === true || config.maxMenu === true || config.closeMenu === true) {
                    var inlayMenu = document.createElement("div");
                    inlayMenu.classList.add("layx-inlay-menus");
                    inlayMenu.classList.add("layx-flexbox");
                    rightBar.appendChild(inlayMenu);
                    if (config.stickMenu === true || (config.alwaysOnTop === true && config.stickMenu)) {
                        var stickMenu = document.createElement("div");
                        stickMenu.classList.add("layx-icon");
                        stickMenu.classList.add("layx-flexbox");
                        stickMenu.classList.add("layx-flex-center");
                        stickMenu.classList.add("layx-stick-menu");
                        config.alwaysOnTop === true ? stickMenu.setAttribute("title", "取消置顶") : stickMenu.setAttribute("title", "置顶");
                        config.alwaysOnTop === true && stickMenu.setAttribute("data-enable", "1");
                        stickMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-stick"></use></svg>';
                        if (config.stickable === true) {
                            stickMenu.onclick = function (e) {
                                e = e || window.event;
                                that.stickToggle(config.id);
                                e.stopPropagation();
                            };
                        }
                        inlayMenu.appendChild(stickMenu);
                    }
                    if (config.minMenu === true) {
                        var minMenu = document.createElement("div");
                        minMenu.classList.add("layx-icon");
                        minMenu.classList.add("layx-flexbox");
                        minMenu.classList.add("layx-flex-center");
                        minMenu.classList.add("layx-min-menu");
                        minMenu.setAttribute("title", "最小化");
                        minMenu.setAttribute("data-menu", "min");
                        minMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-min"></use></svg>';
                        minMenu.onclick = function (e) {
                            e = e || window.event;
                            if (!this.classList.contains("layx-restore-menu")) {
                                if (config.minable === true) {
                                    that.min(config.id);
                                }
                            } else {
                                if (config.restorable === true) {
                                    that.restore(config.id);
                                }
                            }
                            e.stopPropagation();
                        };
                        inlayMenu.appendChild(minMenu);
                    }
                    if (config.maxMenu === true) {
                        var maxMenu = document.createElement("div");
                        maxMenu.classList.add("layx-icon");
                        maxMenu.classList.add("layx-flexbox");
                        maxMenu.classList.add("layx-flex-center");
                        maxMenu.classList.add("layx-max-menu");
                        maxMenu.setAttribute("title", "最大化");
                        maxMenu.setAttribute("data-menu", "max");
                        maxMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-max"></use></svg>';
                        maxMenu.onclick = function (e) {
                            e = e || window.event;
                            if (!this.classList.contains("layx-restore-menu")) {
                                if (config.maxable === true) {
                                    that.max(config.id);
                                }
                            } else {
                                if (config.restorable === true) {
                                    that.restore(config.id);
                                }
                            }
                            e.stopPropagation();
                        };
                        inlayMenu.appendChild(maxMenu);
                    }
                    if (config.closeMenu === true) {
                        var destroyMenu = document.createElement("div");
                        destroyMenu.classList.add("layx-icon");
                        destroyMenu.classList.add("layx-flexbox");
                        destroyMenu.classList.add("layx-flex-center");
                        destroyMenu.classList.add("layx-destroy-menu");
                        destroyMenu.setAttribute("title", "关闭");
                        destroyMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-destroy"></use></svg>';
                        destroyMenu.onclick = function (e) {
                            e = e || window.event;
                            if (config.closable === true) {
                                that.destroy(config.id);
                            }
                            e.stopPropagation();
                        };
                        inlayMenu.appendChild(destroyMenu);
                    }
                }
            }
            var main = document.createElement("div");
            main.classList.add("layx-main");
            main.classList.add("layx-flexauto");
            layxWindow.appendChild(main);
            var contentShade = document.createElement("div");
            contentShade.classList.add("layx-content-shade");
            contentShade.classList.add("layx-flexbox");
            contentShade.classList.add("layx-flex-center");
            if (config.loaddingText !== false) {
                if (Utils.isDom(config.loaddingText)) {
                    contentShade.appendChild(config.loaddingText);
                } else {
                    contentShade.innerHTML = config.loaddingText;
                    var dotCount = 0;
                    var loadTimer = setInterval(function () {
                        if (dotCount === 5) {
                            dotCount = 0;
                        }
                        ++dotCount;
                        var dotHtml = "";
                        for (var i = 0; i < dotCount; i++) {
                            dotHtml += ".";
                        }
                        contentShade.innerHTML = config.loaddingText + dotHtml;
                    }, 200);
                }
            }
            main.appendChild(contentShade);
            switch (config.type) {
                case "html":
                default:
                    if (Utils.isFunction(config.event.onload.before)) {
                        var revel = config.event.onload.before(layxWindow, winform);
                        if (revel === false) {
                            return;
                        }
                    }
                    that.createHtmlBody(main, config, config.content);
                    main.removeChild(contentShade);
                    if (Utils.isFunction(config.event.onload.after)) {
                        config.event.onload.after(layxWindow, winform);
                    }
                    break;
                case "url":
                    if (Utils.isFunction(config.event.onload.before)) {
                        var revel = config.event.onload.before(layxWindow, winform);
                        if (revel === false) {
                            return;
                        }
                    }
                    that.createFrameBody(main, config, layxWindow, winform);
                    break;
                case "group":
                    if (Utils.isArray(config.frames)) {
                        if (Utils.isFunction(config.event.onload.before)) {
                            var revel = config.event.onload.before(layxWindow, winform);
                            if (revel === false) {
                                return;
                            }
                        }
                        var groupLoadCount = 0;
                        for (var i = 0; i < config.frames.length; i++) {
                            var frameConfig = layxDeepClone({}, that.defaultFrames, config.frames[i]);
                            var frameBody = document.createElement("div");
                            frameBody.classList.add("layx-group-main");
                            frameBody.setAttribute("data-frameId", frameConfig.id);
                            if (i === config.frameIndex) {
                                frameBody.setAttribute("data-enable", "1");
                            }
                            main.appendChild(frameBody);
                            if (frameConfig.type === "html") {
                                that.createHtmlBody(frameBody, config, frameConfig.content, "group", frameConfig);
                                frameBody.setAttribute("data-complete", "1");
                                var loadComplteMains = layxWindow.querySelectorAll(".layx-group-main[data-complete='1']");
                                if (loadComplteMains.length === config.frames.length) {
                                    main.removeChild(contentShade);
                                    if (Utils.isFunction(config.event.onload.after)) {
                                        config.event.onload.after(layxWindow, winform);
                                    }
                                }
                            } else if (frameConfig.type === "url") {
                                that.createFrameBody(frameBody, config, layxWindow, winform, "group", frameConfig);
                            }
                        }
                    }
                    break;
            }
            if (config.resizable === true) {
                var resize = document.createElement("div");
                resize.classList.add("layx-resizes");
                layxWindow.appendChild(resize);
                if (config.resizeLimit.t === false) {
                    var resizeTop = document.createElement("div");
                    resizeTop.classList.add("layx-resize-top");
                    new LayxResize(resizeTop, true, false, true, false);
                    resize.appendChild(resizeTop);
                }
                if (config.resizeLimit.r === false) {
                    var resizeRight = document.createElement("div");
                    resizeRight.classList.add("layx-resize-right");
                    new LayxResize(resizeRight, false, false, false, true);
                    resize.appendChild(resizeRight);
                }
                if (config.resizeLimit.b === false) {
                    var resizeBottom = document.createElement("div");
                    resizeBottom.classList.add("layx-resize-bottom");
                    new LayxResize(resizeBottom, false, false, true, false);
                    resize.appendChild(resizeBottom);
                }
                if (config.resizeLimit.l === false) {
                    var resizeLeft = document.createElement("div");
                    resizeLeft.classList.add("layx-resize-left");
                    new LayxResize(resizeLeft, false, true, false, true);
                    resize.appendChild(resizeLeft);
                }
                if (config.resizeLimit.lt === false) {
                    var resizeLeftTop = document.createElement("div");
                    resizeLeftTop.classList.add("layx-resize-left-top");
                    new LayxResize(resizeLeftTop, true, true, false, false);
                    resize.appendChild(resizeLeftTop);
                }
                if (config.resizeLimit.rt === false) {
                    var resizeRightTop = document.createElement("div");
                    resizeRightTop.classList.add("layx-resize-right-top");
                    new LayxResize(resizeRightTop, true, false, false, false);
                    resize.appendChild(resizeRightTop);
                }
                if (config.resizeLimit.lb === false) {
                    var resizeLeftBottom = document.createElement("div");
                    resizeLeftBottom.classList.add("layx-resize-left-bottom");
                    new LayxResize(resizeLeftBottom, false, true, false, false);
                    resize.appendChild(resizeLeftBottom);
                }
                if (config.resizeLimit.rb === false) {
                    var resizeRightBottom = document.createElement("div");
                    resizeRightBottom.classList.add("layx-resize-right-bottom");
                    new LayxResize(resizeRightBottom, false, false, false, false);
                    resize.appendChild(resizeRightBottom);
                }
            }
            if (config.statusBar) {
                var statusBar = document.createElement("div");
                statusBar.classList.add("layx-statu-bar");
                config.statusBarStyle && statusBar.setAttribute("style", config.statusBarStyle);
                if (config.statusBar === true && Utils.isArray(config.buttons)) {
                    var btnElement = that.createLayxButtons(config.buttons, config.id, config.isPrompt);
                    statusBar.appendChild(btnElement);
                } else {
                    if (Utils.isDom(config.statusBar)) {
                        statusBar.appendChild(config.statusBar);
                    } else {
                        statusBar.innerHTML = config.statusBar;
                    }
                }
                layxWindow.appendChild(statusBar);
            }
            if (/(^[1-9]\d*$)/.test(config.autodestroy)) {
                var second = config.autodestroy / 1000;
                if (config.autodestroyText !== false) {
                    var autodestroyTip = document.createElement("div");
                    autodestroyTip.classList.add("layx-auto-destroy-tip");
                    autodestroyTip.innerHTML = config.autodestroyText.replace("{second}", second);
                    layxWindow.appendChild(autodestroyTip);
                }
                var destroyTimer = setInterval(function () {
                    --second;
                    if (config.autodestroyText !== false) {
                        autodestroyTip.innerHTML = config.autodestroyText.replace("{second}", second);
                    }
                    if (second <= 0) {
                        clearInterval(destroyTimer);
                        that.destroy(config.id);
                    }
                }, 1000);
            }
            that.windows[config.id] = winform;
            if (isOverToMax === true) {
                if (_width > window.innerWidth || _height > window.innerHeight) {
                    that.max(config.id);
                }
            }
            return winform;
        },
        removeStoreWindowAreaInfo: function (id) {
            var that = this,
                windowId = "layx-" + id,
                storeAreaInfo = sessionStorage.getItem(windowId);
            if (storeAreaInfo) {
                sessionStorage.removeItem(windowId);
            }
        },
        storeWindowAreaInfo: function (id, area) {
            var that = this,
                windowId = "layx-" + id;
            sessionStorage.setItem(windowId, JSON.stringify(area));
        },
        getStoreWindowAreaInfo: function (id) {
            var that = this,
                windowId = "layx-" + id,
                storeAreaInfo = sessionStorage.getItem(windowId);
            if (storeAreaInfo) {
                return JSON.parse(storeAreaInfo);
            }
            return null;
        },
        _setGroupIndex: function (id, target) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "group") {
                var frameId = target.getAttribute("data-frameId");
                var prevGroupMain = layxWindow.querySelector(".layx-group-main[data-enable='1']");
                var currentGroupMain = layxWindow.querySelector(".layx-group-main[data-frameId='" + frameId + "']");
                if (currentGroupMain !== prevGroupMain) {
                    prevGroupMain.removeAttribute("data-enable");
                    currentGroupMain.setAttribute("data-enable", "1");
                    winform.groupCurrentId = frameId;
                }
            }
        },
        setGroupIndex: function (id, frameId) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                var title = layxWindow.querySelector(".layx-group-title[data-frameId='" + frameId + "']");
                title.click();
            }
        },
        createHtmlBody: function (main, config, content, type, frameConfig) {
            var html = document.createElement("div");
            html.classList.add("layx-html");
            html.setAttribute("id", "layx-" + config.id + (type === "group" ? "-" + frameConfig.id + "-" : "-") + "html");
            if (Utils.isDom(content)) {
                html.appendChild((type === "group" ? frameConfig : config).cloneElementContent === true ? content.cloneNode(true) : content);
            } else {
                html.innerHTML = content;
            }
            main.appendChild(html);
        },
        createFrameBody: function (main, config, layxWindow, winform, type, frameConfig) {
            var that = this;
            var iframe = document.createElement("iframe");
            iframe.setAttribute("id", "layx-" + config.id + (type === "group" ? "-" + frameConfig.id + "-" : "-") + "iframe");
            iframe.classList.add("layx-iframe");
            iframe.classList.add("layx-flexbox");
            iframe.setAttribute("allowtransparency", "true");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("scrolling", "auto");
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("mozallowfullscreen", "");
            iframe.setAttribute("webkitallowfullscreen", "");
            iframe.src = (type === "group" ? frameConfig.url : config.url) || 'about:blank';
            var iframeTitle = config.title;
            if (iframe.attachEvent) {
                iframe.attachEvent("onreadystatechange", function () {
                    if (iframe.readyState === "complete" || iframe.readyState == "loaded") {
                        iframe.detachEvent("onreadystatechange", arguments.callee);
                        try {
                            if (type === "group") {
                                if (frameConfig.useFrameTitle === true) {
                                    iframeTitle = iframe.contentWindow.document.querySelector("title").innerText;
                                    that.setGroupTitle(config.id, frameConfig.id, iframeTitle);
                                }
                            } else {
                                if (config.useFrameTitle === true) {
                                    iframeTitle = iframe.contentWindow.document.querySelector("title").innerText;
                                    that.setTitle(config.id, iframeTitle);
                                }
                            }
                            if (config.focusable === true) {
                                iframe.contentWindow.onclick = function (e) {
                                    var _slf = this.self;
                                    e = e || iframe.contentWindow.event;
                                    if (_slf !== over && _slf.frameElement && _slf.frameElement.tagName === "IFRAME") {
                                        var layxWindow = Utils.getNodeByClassName(_slf.frameElement, 'layx-window', _slf);
                                        var windowId = layxWindow.getAttribute("id").substr(5);
                                        that.updateZIndex(windowId);
                                    }
                                    e.stopPropagation();
                                };
                            }
                        } catch (e) {
                            console.warn(e);
                        }
                        var contentShade = (type === "group" ? this.parentNode.parentNode : this.parentNode).querySelector(".layx-content-shade");
                        if (contentShade) {
                            if (type === "group") {
                                main.setAttribute("data-complete", "1");
                                var loadComplteMains = layxWindow.querySelectorAll(".layx-group-main[data-complete='1']");
                                if (config.frames.length === loadComplteMains.length) {
                                    contentShade.parentNode.removeChild(contentShade);
                                    if (Utils.isFunction(config.event.onload.after)) {
                                        config.event.onload.after(layxWindow, winform);
                                    }
                                }
                            } else {
                                contentShade.parentNode.removeChild(contentShade);
                                if (Utils.isFunction(config.event.onload.after)) {
                                    config.event.onload.after(layxWindow, winform);
                                }
                            }
                        }
                    }
                });
            } else {
                iframe.addEventListener("load", function () {
                    this.removeEventListener("load", arguments.call, false);
                    try {
                        if (type === "group") {
                            if (frameConfig.useFrameTitle === true) {
                                iframeTitle = iframe.contentWindow.document.querySelector("title").innerText;
                                that.setGroupTitle(config.id, frameConfig.id, iframeTitle);
                            }
                        } else {
                            if (config.useFrameTitle === true) {
                                iframeTitle = iframe.contentWindow.document.querySelector("title").innerText;
                                that.setTitle(config.id, iframeTitle);
                            }
                        }
                        if (config.focusable === true) {
                            iframe.contentWindow.onclick = function (e) {
                                var _slf = this.self;
                                e = e || iframe.contentWindow.event;
                                if (_slf !== over && _slf.frameElement && _slf.frameElement.tagName === "IFRAME") {
                                    var layxWindow = Utils.getNodeByClassName(_slf.frameElement, 'layx-window', _slf);
                                    var windowId = layxWindow.getAttribute("id").substr(5);
                                    that.updateZIndex(windowId);
                                }
                                e.stopPropagation();
                            };
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                    var contentShade = (type === "group" ? this.parentNode.parentNode : this.parentNode).querySelector(".layx-content-shade");
                    if (contentShade) {
                        if (type === "group") {
                            main.setAttribute("data-complete", "1");
                            var loadComplteMains = layxWindow.querySelectorAll(".layx-group-main[data-complete='1']");
                            if (config.frames.length === loadComplteMains.length) {
                                contentShade.parentNode.removeChild(contentShade);
                                if (Utils.isFunction(config.event.onload.after)) {
                                    config.event.onload.after(layxWindow, winform);
                                }
                            }
                        } else {
                            contentShade.parentNode.removeChild(contentShade);
                            if (Utils.isFunction(config.event.onload.after)) {
                                config.event.onload.after(layxWindow, winform);
                            }
                        }
                    }
                }, false);
            }
            main.appendChild(iframe);
        },
        setContent: function (id, content) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                if (winform.type === "html") {
                    var html = layxWindow.querySelector("#layx-" + id + "-html");
                    if (html) {
                        var contentShade = document.createElement("div");
                        contentShade.classList.add("layx-content-shade");
                        contentShade.classList.add("layx-flexbox");
                        contentShade.classList.add("layx-flex-center");
                        html.parentNode.appendChild(contentShade);
                        if (Utils.isDom(content)) {
                            html.appendChild(winform.cloneElementContent === true ? content.cloneNode(true) : content);
                        } else {
                            html.innerHTML = content;
                        }
                        html.parentNode.removeChild(contentShade);
                    }
                }
            }
        },
        getGroupFrame: function (frames, frameId) {
            var frm = {};
            for (var i = 0; i < frames.length; i++) {
                if (frames[i].id === frameId) {
                    frm = frames[i];
                    break;
                }
            }
            return frm;
        },
        reloadGroupFrame: function (id, frameId) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "group") {
                var frameform = that.getGroupFrame(winform.frames, frameId);
                if (frameform.type === "url") {
                    var iframe = layxWindow.querySelector("#layx-" + id + "-" + frameId + "-" + "iframe");
                    if (iframe) {
                        var url = iframe.getAttribute("src");
                        that.setGroupUrl(id, frameId, url);
                    }
                }
            }
        },
        setGroupContent: function (id, frameId, content) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "group") {
                var frameform = that.getGroupFrame(winform.frames, frameId);
                if (frameform.type === "html") {
                    var html = layxWindow.querySelector("#layx-" + id + "-" + frameId + "-" + "html");
                    if (html) {
                        var contentShade = document.createElement("div");
                        contentShade.classList.add("layx-content-shade");
                        contentShade.classList.add("layx-flexbox");
                        contentShade.classList.add("layx-flex-center");
                        html.parentNode.parentNode.appendChild(contentShade);
                        if (Utils.isDom(content)) {
                            html.appendChild(frameform.cloneElementContent === true ? content.cloneNode(true) : content);
                        } else {
                            html.innerHTML = content;
                        }
                        frameform.content = content;
                        html.parentNode.parentNode.removeChild(contentShade);
                    }
                }
            }
        },
        setUrl: function (id, url) {
            url = url || 'about:blank';
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                if (winform.type === "url") {
                    var iframe = layxWindow.querySelector("#layx-" + id + "-iframe");
                    if (iframe) {
                        var contentShade = document.createElement("div");
                        contentShade.classList.add("layx-content-shade");
                        contentShade.classList.add("layx-flexbox");
                        contentShade.classList.add("layx-flex-center");
                        if (winform.loaddingText !== false) {
                            if (Utils.isDom(winform.loaddingText)) {
                                contentShade.appendChild(winform.loaddingText);
                            } else {
                                contentShade.innerHTML = winform.loaddingText;
                                var dotCount = 0;
                                var loadTimer = setInterval(function () {
                                    if (dotCount === 5) {
                                        dotCount = 0;
                                    }
                                    ++dotCount;
                                    var dotHtml = "";
                                    for (var i = 0; i < dotCount; i++) {
                                        dotHtml += ".";
                                    }
                                    contentShade.innerHTML = winform.loaddingText + dotHtml;
                                }, 200);
                            }
                        }
                        iframe.parentNode.appendChild(contentShade);
                        iframe.setAttribute("src", url);
                    }
                }
            }
        },
        setGroupUrl: function (id, frameId, url) {
            url = url || 'about:blank';
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "group") {
                var frameform = that.getGroupFrame(winform.frames, frameId);
                if (frameform.type === "url") {
                    var iframe = layxWindow.querySelector("#layx-" + id + "-" + frameId + "-" + "iframe");
                    if (iframe) {
                        iframe.parentNode.removeAttribute("data-complete");
                        var contentShade = document.createElement("div");
                        contentShade.classList.add("layx-content-shade");
                        contentShade.classList.add("layx-flexbox");
                        contentShade.classList.add("layx-flex-center");
                        if (winform.loaddingText !== false) {
                            if (Utils.isDom(winform.loaddingText)) {
                                contentShade.appendChild(winform.loaddingText);
                            } else {
                                contentShade.innerHTML = winform.loaddingText;
                                var dotCount = 0;
                                var loadTimer = setInterval(function () {
                                    if (dotCount === 5) {
                                        dotCount = 0;
                                    }
                                    ++dotCount;
                                    var dotHtml = "";
                                    for (var i = 0; i < dotCount; i++) {
                                        dotHtml += ".";
                                    }
                                    contentShade.innerHTML = winform.loaddingText + dotHtml;
                                }, 200);
                            }
                        }
                        iframe.parentNode.parentNode.appendChild(contentShade);
                        iframe.setAttribute("src", url);
                    }
                }
            }
        },
        setGroupTitle: function (id, frameId, content, useFrameTitle) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "group") {
                var title = layxWindow.querySelector(".layx-group-title[data-frameId='" + frameId + "']");
                if (title) {
                    var frameform = that.getGroupFrame(winform.frames, frameId);
                    if (useFrameTitle === true && frameform.type === "url") {
                        var iframe = layxWindow.querySelector("#layx-" + id + "-" + frameId + "-" + "iframe");
                        try {
                            content = iframe.contentDocument.querySelector("title").innerText;
                        } catch (e) { }
                    }
                    var label = title.querySelector("label");
                    if (label) {
                        label.innerHTML = content;
                        title.setAttribute("title", label.innerHTML);
                        frameform.title = content;
                    }
                }
            }
        },
        setTitle: function (id, content, useFrameTitle) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                var title = layxWindow.querySelector(".layx-title");
                if (title) {
                    if (useFrameTitle === true && winform.type === "url") {
                        var iframe = layxWindow.querySelector("#layx-" + id + "-iframe");
                        try {
                            content = iframe.contentDocument.querySelector("title").innerText;
                        } catch (e) { }
                    }
                    var label = title.querySelector("label");
                    if (label) {
                        label.innerHTML = content;
                        title.setAttribute("title", label.innerHTML);
                        winform.title = content;
                    }
                }
            }
        },
        stickToggle: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                that.updateZIndex(id);
                winform.isStick = !winform.isStick;
                var stickMenu = layxWindow.querySelector(".layx-stick-menu");
                if (stickMenu) {
                    stickMenu.setAttribute("data-enable", winform.isStick ? "1" : "0");
                    winform.isStick ? stickMenu.setAttribute("title", "取消置顶") : stickMenu.setAttribute("title", "置顶");
                }
                that.updateZIndex(id);
            }
        },
        reloadFrame: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                if (winform.type === "url") {
                    var iframe = layxWindow.querySelector("#layx-" + id + "-iframe");
                    if (iframe) {
                        var url = iframe.getAttribute("src");
                        that.setUrl(id, url);
                    }
                }
            }
        },
        restore: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                if (winform.restorable !== true)
                    return;
                that.updateZIndex(id);
                if (Utils.isFunction(winform.event.onrestore.before)) {
                    var revel = winform.event.onrestore.before(layxWindow, winform);
                    if (revel === false) {
                        return;
                    }
                }
                var area = winform.area;
                if (winform.status === "normal") {
                    that.max(id);
                } else if (winform.status === "max") {
                    if (document.body.classList.contains("layx-body")) {
                        document.body.classList.remove('layx-body');
                    }
                    layxWindow.style.top = area.top + "px";
                    layxWindow.style.left = area.left + "px";
                    layxWindow.style.width = area.width + "px";
                    layxWindow.style.height = area.height + "px";
                    winform.status = "normal";
                    var restoreMenu = layxWindow.querySelector(".layx-restore-menu[data-menu='max']");
                    if (restoreMenu) {
                        restoreMenu.classList.remove("layx-restore-menu");
                        restoreMenu.classList.add("layx-max-menu");
                        restoreMenu.setAttribute("title", "最大化");
                        restoreMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-max"></use></svg>';
                    }
                    var resizePanel = layxWindow.querySelector(".layx-resizes");
                    if (resizePanel) {
                        resizePanel.removeAttribute("data-enable");
                    }
                }
                if (winform.status === "min") {
                    if (winform.minBefore === "normal") {
                        layxWindow.style.top = area.top + "px";
                        layxWindow.style.left = area.left + "px";
                        layxWindow.style.width = area.width + "px";
                        layxWindow.style.height = area.height + "px";
                        winform.status = "normal";
                        var restoreMenu = layxWindow.querySelector(".layx-restore-menu[data-menu='min']");
                        if (restoreMenu) {
                            restoreMenu.classList.remove("layx-restore-menu");
                            restoreMenu.classList.add("layx-min-menu");
                            restoreMenu.setAttribute("title", "最小化");
                            restoreMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-min"></use></svg>';
                        }
                        var resizePanel = layxWindow.querySelector(".layx-resizes");
                        if (resizePanel) {
                            resizePanel.removeAttribute("data-enable");
                        }
                    } else if (winform.minBefore === "max") {
                        that.max(id);
                    }
                    that.updateMinLayout();
                }
                var _winform = layxDeepClone({}, winform);
                delete that.windows[id];
                that.windows[id] = _winform;
                that.updateMinLayout();
                if (layxWindow.classList.contains("layx-min-statu")) {
                    layxWindow.classList.remove("layx-min-statu");
                }
                if (Utils.isFunction(winform.event.onrestore.after)) {
                    winform.event.onrestore.after(layxWindow, winform);
                }
            }
        },
        min: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id],
                innertArea = Utils.innerArea();
            if (layxWindow && winform) {
                if (winform.minable !== true || winform.status === "min")
                    return;
                that.updateZIndex(id);
                if (Utils.isFunction(winform.event.onmin.before)) {
                    var revel = winform.event.onmin.before(layxWindow, winform);
                    if (revel === false) {
                        return;
                    }
                }
                winform.minBefore = winform.status;
                winform.status = "min";
                var minMenu = layxWindow.querySelector(".layx-min-menu");
                if (minMenu) {
                    minMenu.classList.remove("layx-max-menu");
                    minMenu.classList.add("layx-restore-menu");
                    minMenu.setAttribute("title", "恢复");
                    minMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-restore"></use></svg>';
                }
                var resizePanel = layxWindow.querySelector(".layx-resizes");
                if (resizePanel) {
                    resizePanel.setAttribute("data-enable", "0");
                }
                var restoreMenu = layxWindow.querySelector(".layx-restore-menu[data-menu='max']");
                if (restoreMenu) {
                    restoreMenu.classList.remove("layx-restore-menu");
                    restoreMenu.classList.add("layx-max-menu");
                    restoreMenu.setAttribute("title", "最大化");
                    restoreMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-max"></use></svg>';
                }
                var _winform = layxDeepClone({}, winform);
                delete that.windows[id];
                that.windows[id] = _winform;
                that.updateMinLayout();
                if (Utils.isFunction(winform.event.onmin.after)) {
                    winform.event.onmin.after(layxWindow, winform);
                }
            }
        },
        updateZIndex: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                var layxShade = document.getElementById("layx-" + id + "-shade");
                if (layxShade) {
                    layxShade.style.zIndex = (winform.isStick === true ? (++that.stickZIndex) : (++that.zIndex));
                }
                if (winform.isStick === true) {
                    winform.zIndex = (++that.stickZIndex) + 1;
                } else {
                    winform.zIndex = (++that.zIndex) + 1;
                }
                layxWindow.style.zIndex = winform.zIndex;
            }
        },
        updateMinLayout: function () {
            var that = this,
                windows = that.windows,
                innertArea = Utils.innerArea(),
                paddingLeft = 10,
                paddingBottom = 10,
                widthByMinStatu = 240,
                stepIndex = 0,
                lineMaxCount = Math.floor(innertArea.width / (widthByMinStatu + paddingLeft));
            for (var id in windows) {
                var winform = windows[id],
                    layxWindow = document.getElementById("layx-" + id);
                if (layxWindow && winform.status === "min") {
                    var control = layxWindow.querySelector(".layx-control-bar");
                    if (control) {
                        var heightByMinStatus = control.offsetHeight;
                        layxWindow.classList.add("layx-min-statu");
                        layxWindow.style.width = widthByMinStatu + 'px';
                        layxWindow.style.height = heightByMinStatus + 'px';
                        layxWindow.style.top = innertArea.height - (Math.floor(stepIndex / lineMaxCount) + 1) * (heightByMinStatus + paddingBottom) + 'px';
                        layxWindow.style.left = stepIndex % lineMaxCount * (widthByMinStatu + paddingLeft) + paddingLeft + 'px';
                        stepIndex++;
                    }
                }
            }
        },
        max: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id],
                innertArea = Utils.innerArea();
            if (layxWindow && winform) {
                if (winform.maxable !== true || winform.status === "max")
                    return;
                that.updateZIndex(id);
                if (Utils.isFunction(winform.event.onmax.before)) {
                    var revel = winform.event.onmax.before(layxWindow, winform);
                    if (revel === false) {
                        return;
                    }
                }
                document.body.classList.add('layx-body');
                layxWindow.style.top = 0;
                layxWindow.style.left = 0;
                layxWindow.style.width = innertArea.width + "px";
                layxWindow.style.height = innertArea.height + "px";
                winform.status = "max";
                var maxMenu = layxWindow.querySelector(".layx-max-menu");
                if (maxMenu) {
                    maxMenu.classList.remove("layx-max-menu");
                    maxMenu.classList.add("layx-restore-menu");
                    maxMenu.setAttribute("title", "恢复");
                    maxMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-restore"></use></svg>';
                }
                var resizePanel = layxWindow.querySelector(".layx-resizes");
                if (resizePanel) {
                    resizePanel.setAttribute("data-enable", "0");
                }
                var restoreMenu = layxWindow.querySelector(".layx-restore-menu[data-menu='min']");
                if (restoreMenu) {
                    restoreMenu.classList.remove("layx-restore-menu");
                    restoreMenu.classList.add("layx-min-menu");
                    restoreMenu.setAttribute("title", "最小化");
                    restoreMenu.innerHTML = '<svg class="layx-iconfont" aria-hidden="true"><use xlink:href="#layx-icon-min"></use></svg>';
                }
                var _winform = layxDeepClone({}, winform);
                delete that.windows[id];
                that.windows[id] = _winform;
                that.updateMinLayout();
                if (layxWindow.classList.contains("layx-min-statu")) {
                    layxWindow.classList.remove("layx-min-statu");
                }
                if (Utils.isFunction(winform.event.onmax.after)) {
                    winform.event.onmax.after(layxWindow, winform);
                }
            }
        },
        destroy: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                layxShade = document.getElementById(windowId + '-shade'),
                winform = that.windows[id];
            if (layxWindow && winform) {
                that.updateZIndex(id);
                if (Utils.isFunction(winform.event.ondestroy.before)) {
                    var revel = winform.event.ondestroy.before(layxWindow, winform);
                    if (revel === false) {
                        return;
                    }
                }
                if (winform.closable !== true)
                    return;
                delete that.windows[id];
                layxWindow.parentNode.removeChild(layxWindow);
                if (layxShade) {
                    layxShade.parentNode.removeChild(layxShade);
                }
                that.updateMinLayout();
                if (Utils.isFunction(winform.event.ondestroy.after)) {
                    winform.event.ondestroy.after();
                }
                for (var key in winform) {
                    delete winform[key];
                }
                winform = undefined;
            }
        },
        destroyAll: function () {
            var that = this;
            for (var id in Layx.windows) {
                that.destroy(id);
            }
        },
        flicker: function (id) {
            var that = this,
                flickerTimer,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                that.updateZIndex(id);
                if (layxWindow.classList.contains('layx-flicker')) {
                    layxWindow.classList.remove('layx-flicker');
                }
                layxWindow.classList.add('layx-flicker');
                flickerTimer = setTimeout(function () {
                    layxWindow.classList.remove('layx-flicker');
                    clearTimeout(flickerTimer);
                }, 120 * 8);
            }
        },
        setPosition: function (id, position) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform) {
                var _position = Utils.compileLayxPosition(winform.area.width, winform.area.height, position);
                winform.area.left = _position.left;
                winform.area.top = _position.top;
                layxWindow.style.left = _position.left + "px";
                layxWindow.style.top = _position.top + "px";
            }
        },
        getFrameContext: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id],
                iframeWindow = null;
            if (layxWindow && winform && winform.type === "url") {
                var iframe = layxWindow.querySelector(".layx-iframe");
                if (iframe) {
                    try {
                        iframeWindow = iframe.contentWindow;
                    } catch (e) { }
                }
            }
            return iframeWindow;
        },
        getParentContext: function (id) {
            var that = this;
            var iframeWindow = that.getFrameContext(id);
            if (iframeWindow) {
                return iframeWindow.parent;
            } else {
                return null;
            }
        },
        getGroupFrameContext: function (id, frameId) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id],
                iframeWindow = null;
            if (layxWindow && winform && winform.type === "group") {
                var frameform = that.getGroupFrame(winform.frames, frameId);
                if (frameform.type === "url") {
                    var iframe = layxWindow.querySelector("#layx-" + id + "-" + frameId + "-" + "iframe");
                    if (iframe) {
                        try {
                            iframeWindow = iframe.contentWindow;
                        } catch (e) { }
                    }
                }
            }
            return iframeWindow;
        },
        createLayxButtons: function (buttons, id, isPrompt) {
            var that = this;
            var buttonPanel = document.createElement("div");
            buttonPanel.classList.add("layx-buttons");
            for (var i = 0; i < buttons.length; i++) {
                var buttonItem = document.createElement("button");
                var buttonConfig = layxDeepClone({}, that.defaultButtons, buttons[i]);
                buttonItem.classList.add("layx-button-item");
                buttonItem.innerText = buttonConfig.label;
                buttonItem.callback = buttons[i].callback;
                buttonItem.onclick = function (e) {
                    if (Utils.isFunction(this.callback)) {
                        if (isPrompt === true) {
                            var textarea = that.getPromptTextArea(id);
                            this.callback(id, (textarea ? textarea.value : "").replace(/(^\s*)|(\s*$)/g, ""), textarea);
                        } else {
                            this.callback(id);
                        }
                    }
                };
                buttonPanel.appendChild(buttonItem);
            }
            return buttonPanel;
        },
        msg: function (msg, options) {
            var that = this;
            var winform = that.create(layxDeepClone({}, {
                id: 'layx-msg-' + Utils.rndNum(8),
                type: 'html',
                control: false,
                content: "<div class='layx-msg layx-flexbox layx-flex-center' style='height:83px;width:100%;'>" + msg + "</div>",
                autodestroy: 5000,
                width: 320,
                height: 85,
                minHeight: 85,
                stickMenu: false,
                minMenu: false,
                maxMenu: false,
                closeMenu: false,
                alwaysOnTop: true,
                resizable: false,
                movable: false,
                allowControlDbclick: false,
                position: [10, 'tc'],
                autodestroyText: false,
                loaddingText: false
            }, options));
            return winform;
        },
        alert: function (title, msg, yes, options) {
            var that = this;
            var winform = that.create(layxDeepClone({}, {
                id: 'layx-alert-' + Utils.rndNum(8),
                title: title || "提示消息",
                icon: false,
                type: 'html',
                content: "<div class='layx-alert'>" + msg + "</div>",
                width: 352,
                height: 157,
                minHeight: 157,
                stickMenu: false,
                minMenu: false,
                minable: false,
                maxMenu: false,
                maxable: false,
                alwaysOnTop: true,
                resizable: false,
                allowControlDbclick: false,
                shadable: true,
                statusBar: true,
                buttons: [{
                    label: '确定',
                    callback: function (id) {
                        if (Utils.isFunction(yes)) {
                            yes(id);
                        } else {
                            Layx.destroy(id);
                        }
                    }
                }],
                position: 'ct',
                loaddingText: false
            }, options));
            return winform;
        },
        confirm: function (title, msg, yes, options) {
            var that = this;
            var winform = that.create(layxDeepClone({}, {
                id: 'layx-confirm-' + Utils.rndNum(8),
                title: title || "询问消息",
                icon: false,
                type: 'html',
                content: "<div class='layx-confirm'>" + msg + "</div>",
                width: 352,
                height: 157,
                minHeight: 157,
                stickMenu: false,
                minMenu: false,
                minable: false,
                maxMenu: false,
                maxable: false,
                alwaysOnTop: true,
                resizable: false,
                allowControlDbclick: false,
                shadable: true,
                buttons: [{
                    label: '确定',
                    callback: function (id) {
                        if (Utils.isFunction(yes)) {
                            yes(id);
                        }
                    }
                }, {
                    label: '取消',
                    callback: function (id) {
                        Layx.destroy(id);
                    }
                }],
                statusBar: true,
                position: 'ct',
                loaddingText: false
            }, options));
            return winform;
        },
        getPromptTextArea: function (id) {
            var that = this,
                windowId = "layx-" + id,
                layxWindow = document.getElementById(windowId),
                winform = that.windows[id];
            if (layxWindow && winform && winform.type === "html") {
                var promptPanel = layxWindow.querySelector(".layx-prompt");
                if (promptPanel) {
                    var textarea = promptPanel.querySelector(".layx-textarea");
                    if (textarea) {
                        return textarea;
                    }
                }
            }
            return null;
        },
        prompt: function (title, msg, yes, options) {
            var that = this;
            var winform = that.create(layxDeepClone({}, {
                id: 'layx-prompt-' + Utils.rndNum(8),
                title: title || "请输入信息",
                icon: false,
                type: 'html',
                content: "<div class='layx-prompt'><label>" + msg + "</label><textarea class='layx-textarea'></textarea></div>",
                width: 352,
                height: 200,
                minHeight: 200,
                stickMenu: false,
                minMenu: false,
                minable: false,
                maxMenu: false,
                maxable: false,
                alwaysOnTop: true,
                resizable: false,
                allowControlDbclick: false,
                shadable: true,
                statusBar: true,
                isPrompt: true,
                buttons: [{
                    label: '确定',
                    callback: function (id, value, textarea) {
                        if (textarea && value.length === 0) {
                            textarea.focus();
                        } else {
                            if (Utils.isFunction(yes)) {
                                yes(id, value, textarea);
                            }
                        }
                    }
                }, {
                    label: '取消',
                    callback: function (id, value, textarea) {
                        Layx.destroy(id);
                    }
                }],
                position: 'ct',
                loaddingText: false
            }, options));
            return winform;
        },
        load: function (id, msg, options) {
            var that = this;
            var loadElement = document.createElement("div");
            loadElement.classList.add("layx-load");
            loadElement.classList.add("layx-flexbox");
            loadElement.classList.add("layx-flex-center");
            loadElement.style.height = 83 + "px";
            loadElement.style.width = "100%";
            loadElement.innerHTML = msg;
            var dotCount = 0;
            var loadTimer = setInterval(function () {
                if (dotCount === 5) {
                    dotCount = 0;
                }
                ++dotCount;
                var dotHtml = "";
                for (var i = 0; i < dotCount; i++) {
                    dotHtml += ".";
                }
                loadElement.innerHTML = msg + dotHtml;
            }, 200);
            var winform = that.create(layxDeepClone({}, {
                id: id ? id : 'layx-load-' + Utils.rndNum(8),
                type: 'html',
                control: false,
                shadable: true,
                content: loadElement,
                cloneElementContent: false,
                width: 320,
                height: 85,
                minHeight: 85,
                stickMenu: false,
                minMenu: false,
                maxMenu: false,
                closeMenu: false,
                alwaysOnTop: true,
                resizable: false,
                movable: false,
                allowControlDbclick: false,
                position: 'ct',
                loaddingText: false
            }, options));
            return winform;
        }
    };
    var Utils = {
        isBoolean: function (obj) {
            return typeof obj === "boolean";
        },
        isString: function (obj) {
            return typeof obj === "string";
        },
        isNumber: function (obj) {
            return typeof obj === "number";
        },
        isArray: function (o) {
            return Object.prototype.toString.call(o) == '[object Array]';
        },
        isFunction: function (func) {
            return func && Object.prototype.toString.call(func) === '[object Function]';
        },
        isDom: function (obj) {
            return !!(obj && typeof window !== 'undefined' && (obj === window || obj.nodeType));
        },
        innerArea: function () {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        compileLayxPosition: function (width, height, position) {
            var that = this,
                postionOptions = ['ct', 'lt', 'rt', 'lb', 'rb', 'lc', 'tc', 'rc', 'bc'],
                innerArea = that.innerArea();
            var pos = {
                top: 0,
                left: 0
            };
            if (that.isArray(position) && position.length === 2) {
                pos.top = that.isNumber(position[0]) ? position[0] : that.compileLayxPosition(width, height, position[0]).top;
                pos.left = that.isNumber(position[1]) ? position[1] : that.compileLayxPosition(width, height, position[1]).left;
            } else {
                position = postionOptions.indexOf(position.toString()) > -1 ? position.toString() : 'ct';
                switch (position) {
                    case 'ct':
                        pos.top = (innerArea.height - height) / 2;
                        pos.left = (innerArea.width - width) / 2;
                        break;
                    case 'lt':
                        pos.top = 0;
                        pos.left = 0;
                        break;
                    case 'rt':
                        pos.top = 0;
                        pos.left = innerArea.width - width;
                        break;
                    case 'lb':
                        pos.top = innerArea.height - height;
                        pos.left = 0;
                        break;
                    case 'rb':
                        pos.top = innerArea.height - height;
                        pos.left = innerArea.width - width;
                        break;
                    case 'lc':
                        pos.left = 0;
                        pos.top = (innerArea.height - height) / 2;
                        break;
                    case 'tc':
                        pos.top = 0;
                        pos.left = (innerArea.width - width) / 2;
                        break;
                    case 'rc':
                        pos.left = innerArea.width - width;
                        pos.top = (innerArea.height - height) / 2;
                        break;
                    case 'bc':
                        pos.top = innerArea.height - height;
                        pos.left = (innerArea.width - width) / 2;
                        break;
                }
            }
            return pos;
        },
        rndNum: function (n) {
            var rnd = "";
            for (var i = 0; i < n; i++)
                rnd += Math.floor(Math.random() * 10);
            return rnd;
        },
        compileLayxWidthOrHeight: function (type, widthOrHeight, errorValue) {
            var that = this,
                innerArea = that.innerArea();
            if (/(^[1-9]\d*$)/.test(widthOrHeight)) {
                return Number(widthOrHeight);
            }
            if (/^(100|[1-9]?\d(\.\d\d?)?)%$/.test(widthOrHeight)) {
                var value = Number(widthOrHeight.toString().replace('%', ''));
                if (type === "width") {
                    return innerArea.width * (value / 100);
                }
                if (type === "height") {
                    return innerArea.height * (value / 100);
                }
            }
            return errorValue;
        },
        getNodeByClassName: function (node, className, parentWindow) {
            parentWindow = parentWindow || win;
            var that = this;
            if (node === parentWindow.document.body) {
                return null;
            }
            var cls = node.classList;
            if (cls.contains(className)) {
                return node;
            } else {
                return that.getNodeByClassName(node.parentNode, className);
            }
        },
        getMousePosition: function (e) {
            e = e || window.event;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            var x = e.pageX || e.clientX + scrollX;
            var y = e.pageY || e.clientY + scrollY;
            return {
                'x': x,
                'y': y
            };
        }
    };
    var LayxResize = function (handle, isTop, isLeft, lockX, lockY) {
        LayxResize.isResizing = false;
        LayxResize.isFirstResizing = true;
        var drag = function (e) {
            e = e || window.event;
            var button = e.button || e.which;
            if (button == 1 && e.shiftKey == false) {
                e.preventDefault();
                var moveMouseCoord = Utils.getMousePosition(e),
                    distX = moveMouseCoord.x - handle.mouseStartCoord.x,
                    distY = moveMouseCoord.y - handle.mouseStartCoord.y,
                    _top = handle.winform.area.top + distY,
                    _left = handle.winform.area.left + distX,
                    _height = isTop ? handle.winform.area.height - distY : handle.winform.area.height + distY,
                    _width = isLeft ? handle.winform.area.width - distX : handle.winform.area.width + distX;
                if (distX !== 0 || distY !== 0) {
                    LayxResize.isResizing = true;
                    document.body.classList.add('layx-body');
                    if (LayxResize.isFirstResizing === true) {
                        LayxResize.isFirstResizing = false;
                        if (Utils.isFunction(handle.winform.event.onresize.before)) {
                            var reval = handle.winform.event.onresize.before(handle.layxWindow, handle.winform);
                            if (reval === false) {
                                LayxResize.isResizing = false;
                                LayxResize.isFirstResizing = true;
                                document.onmouseup = null;
                                document.onmousemove = null;
                                return;
                            }
                        }
                    }
                    _width = Math.max(_width, handle.winform.area.minWidth);
                    if (isLeft) {
                        _left = Math.min(_left, handle.winform.area.left + handle.winform.area.width - handle.winform.area.minWidth);
                        _left = Math.max(0, _left);
                        _width = Math.min(_width, handle.winform.area.left + handle.winform.area.width);
                    } else {
                        _left = Math.min(_left, handle.winform.area.left);
                        _left = Math.max(handle.winform.area.left, _left);
                        _width = Math.min(_width, handle.innerArea.width - handle.winform.area.left);
                    }
                    _height = Math.max(_height, handle.winform.area.minHeight);
                    if (isTop) {
                        _top = Math.min(_top, handle.winform.area.top + handle.winform.area.height - handle.winform.area.minHeight);
                        _top = Math.max(0, _top);
                        _height = Math.min(_height, handle.winform.area.top + handle.winform.area.height);
                    } else {
                        _top = Math.min(_top, handle.winform.area.top);
                        _top = Math.max(handle.winform.area.top, _top);
                        _height = Math.min(_height, handle.innerArea.height - handle.winform.area.top);
                    }
                    if (lockY) {
                        handle.layxWindow.style.width = _width + 'px';
                        handle.layxWindow.style.left = _left + 'px';
                    }
                    if (lockX) {
                        handle.layxWindow.style.top = _top + 'px';
                        handle.layxWindow.style.height = _height + 'px';
                    }
                    if (lockY === false && lockX === false) {
                        handle.layxWindow.style.width = _width + 'px';
                        handle.layxWindow.style.left = _left + 'px';
                        handle.layxWindow.style.top = _top + 'px';
                        handle.layxWindow.style.height = _height + 'px';
                    }
                    if (Utils.isFunction(handle.winform.event.onresize.progress)) {
                        handle.winform.event.onresize.progress(handle.layxWindow, handle.winform);
                    }
                }
            }
        };
        var dragend = function (e) {
            e = e || window.event;
            document.onmouseup = null;
            document.onmousemove = null;
            var mousePreventDefault = handle.layxWindow.querySelector(".layx-mouse-preventDefault");
            if (mousePreventDefault) {
                mousePreventDefault.parentNode.removeChild(mousePreventDefault);
            }
            var layxMove = document.getElementById("layx-window-move");
            if (layxMove) {
                layxMove.parentNode.removeChild(layxMove);
            }
            if (LayxResize.isResizing === true) {
                LayxResize.isResizing = false;
                LayxResize.isFirstResizing = true;
                handle.winform.area.top = handle.layxWindow.offsetTop;
                handle.winform.area.left = handle.layxWindow.offsetLeft;
                handle.winform.area.width = handle.layxWindow.offsetWidth;
                handle.winform.area.height = handle.layxWindow.offsetHeight;
                Layx.storeWindowAreaInfo(handle.winform.id, {
                    top: handle.winform.area.top,
                    left: handle.winform.area.left,
                    width: handle.winform.area.width,
                    height: handle.winform.area.height
                });
                if (document.body.classList.contains("layx-body")) {
                    document.body.classList.remove('layx-body');
                }
                if (Utils.isFunction(handle.winform.event.onresize.after)) {
                    handle.winform.event.onresize.after(handle.layxWindow, handle.winform);
                }
            }
        };
        var dragstart = function (e) {
            e = e || window.event;
            var layxWindow = Utils.getNodeByClassName(handle, 'layx-window', win);
            if (layxWindow) {
                var id = layxWindow.getAttribute("id").substr(5),
                    winform = Layx.windows[id];
                if (winform) {
                    if (winform.status !== "min" && winform.resizable === true) {
                        var layxMove = document.getElementById("layx-window-move");
                        if (!layxMove) {
                            layxMove = document.createElement("div");
                            layxMove.setAttribute("id", "layx-window-move");
                            document.body.appendChild(layxMove);
                        }
                        Layx.updateZIndex(id);
                        layxMove.style.zIndex = winform.zIndex - 1;
                        var mouseCoord = Utils.getMousePosition(e);
                        handle.mouseStartCoord = mouseCoord;
                        handle.layxWindow = layxWindow;
                        handle.winform = winform;
                        handle.innerArea = Utils.innerArea();
                        var mousePreventDefault = layxWindow.querySelector(".layx-mouse-preventDefault");
                        if (!mousePreventDefault) {
                            mousePreventDefault = document.createElement("div");
                            mousePreventDefault.classList.add("layx-mouse-preventDefault");
                            var main = layxWindow.querySelector(".layx-main");
                            if (main) {
                                main.appendChild(mousePreventDefault);
                            }
                        }
                        document.onmouseup = dragend;
                        document.onmousemove = drag;
                    } else {
                        Layx.restore(id);
                    }
                }
            }
            return false;
        };
        handle.onmousedown = dragstart;
    };
    var LayxDrag = function (handle) {
        LayxDrag.isMoveing = false;
        LayxDrag.isFirstMoveing = true;
        var drag = function (e) {
            e = e || window.event;
            var button = e.button || e.which;
            if (button == 1 && e.shiftKey == false) {
                e.preventDefault();
                var moveMouseCoord = Utils.getMousePosition(e),
                    distX = moveMouseCoord.x - handle.mouseStartCoord.x,
                    distY = moveMouseCoord.y - handle.mouseStartCoord.y;
                if (distX !== 0 || distY !== 0) {
                    LayxDrag.isMoveing = true;
                    document.body.classList.add('layx-body');
                    if (LayxDrag.isFirstMoveing === true) {
                        LayxDrag.isFirstMoveing = false;
                        if (Utils.isFunction(handle.winform.event.onmove.before)) {
                            var reval = handle.winform.event.onmove.before(handle.layxWindow, handle.winform);
                            if (reval === false) {
                                LayxDrag.isMoveing = false;
                                LayxDrag.isFirstMoveing = true;
                                document.onmouseup = null;
                                document.onmousemove = null;
                                return;
                            }
                        }
                    }
                    var _left = handle.winform.area.left + distX;
                    var _top = handle.winform.area.top + distY;
                    if (handle.winform.status === "max" && handle.winform.resizable === true) {
                        if (moveMouseCoord.x < handle.winform.area.width / 2) {
                            _left = 0;
                        } else if (moveMouseCoord.x > handle.winform.area.width / 2 && moveMouseCoord.x < handle.innerArea.width - handle.winform.area.width) {
                            _left = moveMouseCoord.x - handle.winform.area.width / 2;
                        } else if (handle.innerArea.width - moveMouseCoord.x < handle.winform.area.width / 2) {
                            _left = handle.innerArea.width - handle.winform.area.width;
                        } else if (handle.innerArea.width - moveMouseCoord.x > handle.winform.area.width / 2 && moveMouseCoord.x >= handle.innerArea.width - handle.winform.area.width) {
                            _left = moveMouseCoord.x - handle.winform.area.width / 2;
                        }
                        _top = 0;
                        handle.winform.area.top = 0;
                        handle.winform.area.left = _left;
                        Layx.restore(handle.winform.id);
                    }
                    handle.winform.moveLimit.horizontal === true && (_left = handle.winform.area.left);
                    handle.winform.moveLimit.vertical === true && (_top = handle.winform.area.top);
                    handle.winform.moveLimit.leftOut === false && (_left = Math.max(_left, 0));
                    handle.winform.moveLimit.rightOut === false && (_left = Math.min(_left, handle.innerArea.width - handle.winform.area.width));
                    handle.winform.moveLimit.bottomOut === false && (_top = Math.min(_top, handle.innerArea.height - handle.winform.area.height));
                    _top = Math.max(_top, 0);
                    _top = Math.min(handle.innerArea.height - 15, _top);
                    handle.layxWindow.style.left = _left + "px";
                    handle.layxWindow.style.top = _top + "px";
                    if (Utils.isFunction(handle.winform.event.onmove.progress)) {
                        handle.winform.event.onmove.progress(handle.layxWindow, handle.winform);
                    }
                }
            }
        };
        var dragend = function (e) {
            e = e || window.event;
            document.onmouseup = null;
            document.onmousemove = null;
            var mousePreventDefault = handle.layxWindow.querySelector(".layx-mouse-preventDefault");
            if (mousePreventDefault) {
                mousePreventDefault.parentNode.removeChild(mousePreventDefault);
            }
            var layxMove = document.getElementById("layx-window-move");
            if (layxMove) {
                layxMove.parentNode.removeChild(layxMove);
            }
            if (LayxDrag.isMoveing === true) {
                LayxDrag.isMoveing = false;
                LayxDrag.isFirstMoveing = true;
                handle.winform.area.top = handle.layxWindow.offsetTop;
                handle.winform.area.left = handle.layxWindow.offsetLeft;
                Layx.storeWindowAreaInfo(handle.winform.id, {
                    top: handle.winform.area.top,
                    left: handle.winform.area.left,
                    width: handle.winform.area.width,
                    height: handle.winform.area.height
                });
                if (document.body.classList.contains("layx-body")) {
                    document.body.classList.remove('layx-body');
                }
                if (handle.winform.area.top === 0 && handle.winform.status === "normal" && handle.winform.maxable === true && handle.winform.resizable === true) {
                    handle.winform.area.top = handle.defaultArea.top;
                    handle.winform.area.left = handle.defaultArea.left;
                    Layx.storeWindowAreaInfo(handle.winform.id, {
                        top: handle.winform.area.top,
                        left: handle.winform.area.left,
                        width: handle.winform.area.width,
                        height: handle.winform.area.height
                    });
                    Layx.max(handle.winform.id);
                }
                if (Utils.isFunction(handle.winform.event.onmove.after)) {
                    handle.winform.event.onmove.after(handle.layxWindow, handle.winform);
                }
            }
        };
        var dragstart = function (e) {
            e = e || window.event;
            var layxWindow = Utils.getNodeByClassName(handle, 'layx-window', win);
            if (layxWindow) {
                var id = layxWindow.getAttribute("id").substr(5),
                    winform = Layx.windows[id];
                if (winform) {
                    if (winform.status !== "min" && winform.movable === true) {
                        var layxMove = document.getElementById("layx-window-move");
                        if (!layxMove) {
                            layxMove = document.createElement("div");
                            layxMove.setAttribute("id", "layx-window-move");
                            document.body.appendChild(layxMove);
                        }
                        Layx.updateZIndex(id);
                        layxMove.style.zIndex = winform.zIndex - 1;
                        var mouseCoord = Utils.getMousePosition(e);
                        handle.mouseStartCoord = mouseCoord;
                        handle.layxWindow = layxWindow;
                        handle.winform = winform;
                        handle.innerArea = Utils.innerArea();
                        handle.defaultArea = layxDeepClone({}, winform.area);
                        var mousePreventDefault = layxWindow.querySelector(".layx-mouse-preventDefault");
                        if (!mousePreventDefault) {
                            mousePreventDefault = document.createElement("div");
                            mousePreventDefault.classList.add("layx-mouse-preventDefault");
                            var main = layxWindow.querySelector(".layx-main");
                            if (main) {
                                main.appendChild(mousePreventDefault);
                            }
                        }
                        document.onmouseup = dragend;
                        document.onmousemove = drag;
                    } else {
                        Layx.restore(id);
                    }
                }
            }
            return false;
        };
        handle.onmousedown = dragstart;
    };
    win.layx = {
        v: (function () {
            return Layx.version;
        })(),
        open: function (options) {
            var winform = Layx.create(options);
            return winform;
        },
        html: function (id, title, content, options) {
            var winform = Layx.create(layxDeepClone({}, {
                id: id,
                title: title,
                type: 'html',
                content: content
            }, options || {}));
            return winform;
        },
        iframe: function (id, title, url, options) {
            var winform = Layx.create(layxDeepClone({}, {
                id: id,
                title: title,
                type: 'url',
                url: url
            }, options || {}));
            return winform;
        },
        group: function (id, frames, frameIndex, options) {
            var winform = Layx.create(layxDeepClone({}, {
                id: id,
                type: 'group',
                frames: frames,
                frameIndex: typeof frameIndex === "number" ? (frameIndex > frames.length ? 0 : frameIndex) : 0
            }, options || {}));
            return winform;
        },
        windows: function () {
            return Layx.windows;
        },
        getWindow: function (id) {
            return Layx.windows[id];
        },
        destroy: function (id) {
            Layx.destroy(id);
        },
        min: function (id) {
            Layx.min(id);
        },
        max: function (id) {
            Layx.max(id);
        },
        setTitle: function (id, title, useFrameTitle) {
            Layx.setTitle(id, title, useFrameTitle);
        },
        flicker: function (id) {
            Layx.flicker(id);
        },
        restore: function (id) {
            Layx.restore(id);
        },
        updateZIndex: function (id) {
            Layx.updateZIndex(id);
        },
        updateMinLayout: function () {
            Layx.updateMinLayout();
        },
        stickToggle: function (id) {
            Layx.stickToggle(id);
        },
        setPosition: function (id, position) {
            Layx.setPosition(id, position);
        },
        getFrameContext: function (id) {
            return Layx.getFrameContext(id);
        },
        getParentContext: function (id) {
            return Layx.getParentContext(id);
        },
        setContent: function (id, content) {
            Layx.setContent(id, content);
        },
        setUrl: function (id, url) {
            Layx.setUrl(id, url);
        },
        setGroupContent: function (id, frameId, content) {
            Layx.setGroupContent(id, frameId, content);
        },
        setGroupTitle: function (id, frameId, title, useFrameTitle) {
            Layx.setGroupTitle(id, frameId, title, useFrameTitle);
        },
        setGroupUrl: function (id, frameId, url) {
            Layx.setGroupUrl(id, frameId, url);
        },
        setGroupIndex: function (id, frameId) {
            Layx.setGroupIndex(id, frameId);
        },
        getGroupFrameContext: function (id, frameId) {
            return Layx.getGroupFrameContext(id, frameId);
        },
        destroyAll: function () {
            Layx.destroyAll();
        },
        msg: function (msg, options) {
            return Layx.msg(msg, options);
        },
        alert: function (title, msg, yes, options) {
            return Layx.alert(title, msg, yes, options);
        },
        confirm: function (title, msg, yes, options) {
            return Layx.confirm(title, msg, yes, options);
        },
        getPromptTextArea: function (id) {
            return Layx.getPromptTextArea(id);
        },
        prompt: function (title, msg, yes, options) {
            return Layx.prompt(title, msg, yes, options);
        },
        load: function (id, msg, options) {
            return Layx.load(id, msg, options);
        },
        multiLine: function (f) {
            return f.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '');
        },
        reloadFrame: function (id) {
            Layx.reloadFrame(id);
        },
        reloadGroupFrame: function (id, frameId) {
            Layx.reloadGroupFrame(id, frameId);
        }
    };
})(top, window, self);
;
!(function (global) {
    var extend,
        _extend,
        _isObject;
    _isObject = function (o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    };
    _extend = function self(destination, source) {
        var property;
        for (property in destination) {
            if (destination.hasOwnProperty(property)) {
                if (_isObject(destination[property]) && _isObject(source[property])) {
                    self(destination[property], source[property]);
                }
                if (source.hasOwnProperty(property)) {
                    continue;
                } else {
                    source[property] = destination[property];
                }
            }
        }
    };
    extend = function () {
        var arr = arguments,
            result = {},
            i;
        if (!arr.length)
            return {};
        for (i = arr.length - 1; i >= 0; i--) {
            if (_isObject(arr[i])) {
                _extend(arr[i], result);
            }
        }
        arr[0] = result;
        return result;
    };
    global.layxDeepClone = extend;
})(window);
;
!(function (window) {
    var svgSprite = '<svg><symbol id="layx-icon-restore" viewBox="0 0 1157 1024"><path d="M1016.52185234 724.44050175L833.87364805 724.44050175 833.87364805 898.52098643 833.87364805 960.05279112 833.87364805 961.2211168 772.34184336 961.2211168 772.34184336 960.05279112 124.31068789 960.05279112 124.31068789 961.2211168 62.7788832 961.2211168 62.7788832 960.05279112 62.7788832 898.52098643 62.7788832 360.31241885 62.7788832 298.78061416 124.31068789 298.78061416 298.78061416 298.78061416 298.78061416 62.7788832 303.06447442 62.7788832 360.31241885 62.7788832 1016.52185234 62.7788832 1074.15923838 62.7788832 1078.05365615 62.7788832 1078.05365615 662.90869795 1078.05365615 724.44050175 1016.52185234 724.44050175ZM124.31068789 898.52098643L772.34184336 898.52098643 772.34184336 724.44050175 772.34184336 662.90869795 772.34184336 360.31241885 124.31068789 360.31241885 124.31068789 898.52098643ZM1016.52185234 124.31068789L360.31241885 124.31068789 360.31241885 298.78061416 772.34184336 298.78061416 833.87364805 298.78061416 833.87364805 360.31241885 833.87364805 662.90869795 1016.52185234 662.90869795 1016.52185234 124.31068789Z"  ></path></symbol><symbol id="layx-icon-default-icon" viewBox="0 0 1024 1024"><path d="M891.88743395 61.93952995L132.11256605 61.93952995c-38.92547129 0-70.60411733 31.65534435-70.60411734 70.5924665L61.50844871 891.46800355c0 38.91382045 31.67864605 70.59246649 70.60411734 70.5924665l759.7748679 0c38.92547129 0 70.60411733-31.67864605 70.60411734-70.5924665L962.49155129 132.53199645C962.49155129 93.59487431 930.81290525 61.93952995 891.88743395 61.93952995zM844.02576498 142.29540409c16.71896178 0 30.25724302 13.54993209 30.25724302 30.26889386 0 16.70731093-13.53828125 30.25724302-30.25724302 30.25724303s-30.25724302-13.54993209-30.25724303-30.25724303C813.76852195 155.84533618 827.3068032 142.29540409 844.02576498 142.29540409zM735.60300658 142.29540409c16.71896178 0 30.25724302 13.54993209 30.25724302 30.26889386 0 16.70731093-13.53828125 30.25724302-30.25724302 30.25724303s-30.25724302-13.54993209-30.25724303-30.25724303C705.34576355 155.84533618 718.8840448 142.29540409 735.60300658 142.29540409zM881.80945351 881.37837227L142.19054649 881.37837227 142.19054649 277.92288427l739.60725618 0L881.79780267 881.37837227zM758.85809209 638.26020125l-0.01165084-180.19196018 90.09598008 90.09598008L758.85809209 638.26020125zM265.15355875 638.26020125l-90.09598008-90.0959801 90.08432924-90.08432924L265.15355875 638.26020125z"  ></path></symbol><symbol id="layx-icon-min" viewBox="0 0 1024 1024"><path d="M65.23884 456.152041 958.760137 456.152041l0 111.695918L65.23884 567.847959 65.23884 456.152041z"  ></path></symbol><symbol id="layx-icon-max" viewBox="0 0 1024 1024"><path d="M75.74912227 948.24738475L75.74912227 75.75145131l872.50059037 0 0 872.49593344L75.74912227 948.24738475zM839.18786674 184.81446115L184.81213326 184.81446115l0 654.37573462 654.37573461 0L839.18786674 184.81446115z"  ></path></symbol><symbol id="layx-icon-destroy" viewBox="0 0 1024 1024"><path d="M933.89254819 139.71606348L884.23129279 90.08990363 511.96490363 462.39138834 140.40044113 90.82692583 90.84447403 140.34779656 462.40893653 511.91225907 90.10745181 884.2137446 139.73361166 933.875 512.03509637 561.53841892 883.59955887 933.10288141 933.15552597 883.58201068 561.59106347 512.01754819Z"  ></path></symbol><symbol id="layx-icon-stick" viewBox="0 0 1024 1024"><path d="M863.92416068 184.3484319H160.07583932a50.27488011 50.27488011 0 0 1 0-100.5497602h703.84832136a50.27488011 50.27488011 0 0 1 0 100.5497602z m-50.27488007 804.39808157a50.22460522 50.22460522 0 0 1-35.69516489-14.57971521L512 708.21268254l-265.95411572 265.95411572A50.27488011 50.27488011 0 0 1 160.07583932 938.47163339V335.1730722a50.27488011 50.27488011 0 0 1 50.27488007-50.27488013h603.29856122a50.27488011 50.27488011 0 0 1 50.27488007 50.27488013v603.29856119a50.27488011 50.27488011 0 0 1-50.27488007 50.27488008z m-301.64928061-402.19904078a50.22460522 50.22460522 0 0 1 35.69516487 14.57971522L763.37440051 816.80642355V385.44795228H260.62559949v431.86122007l215.67923564-215.67923564A50.27488011 50.27488011 0 0 1 512 586.54747269z"  ></path></symbol></svg>';
    var script = function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
    }();
    var shouldInjectCss = script.getAttribute("data-injectcss");
    var ready = function (fn) {
        if (document.addEventListener) {
            if (~["complete", "loaded", "interactive"].indexOf(document.readyState)) {
                setTimeout(fn, 0);
            } else {
                var loadFn = function () {
                    document.removeEventListener("DOMContentLoaded", loadFn, false);
                    fn();
                };
                document.addEventListener("DOMContentLoaded", loadFn, false);
            }
        } else if (document.attachEvent) {
            IEContentLoaded(window, fn);
        }
        function IEContentLoaded(w, fn) {
            var d = w.document,
                done = false,
                init = function () {
                    if (!done) {
                        done = true;
                        fn();
                    }
                };
            var polling = function () {
                try {
                    d.documentElement.doScroll("left");
                } catch (e) {
                    setTimeout(polling, 50);
                    return;
                }
                init();
            };
            polling();
            d.onreadystatechange = function () {
                if (d.readyState == "complete") {
                    d.onreadystatechange = null;
                    init();
                }
            };
        }
    };
    var before = function (el, target) {
        target.parentNode.insertBefore(el, target);
    };
    var prepend = function (el, target) {
        if (target.firstChild) {
            before(el, target.firstChild);
        } else {
            target.appendChild(el);
        }
    };
    function appendSvg() {
        var div,
            svg;
        div = document.createElement("div");
        div.innerHTML = svgSprite;
        svgSprite = null;
        svg = div.getElementsByTagName("svg")[0];
        if (svg) {
            svg.setAttribute("aria-hidden", "true");
            svg.style.position = "absolute";
            svg.style.width = 0;
            svg.style.height = 0;
            svg.style.overflow = "hidden";
            prepend(svg, document.body);
        }
    }
    if (shouldInjectCss && !window.__iconfont__svg__cssinject__) {
        window.__iconfont__svg__cssinject__ = true;
        try {
            document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>");
        } catch (e) {
            console && console.log(e);
        }
    }
    ready(appendSvg);
})(window);
