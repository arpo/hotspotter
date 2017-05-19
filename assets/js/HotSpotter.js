/*
 * HosSpotter
 * @version 0.1
 *
 * @author Mattias Johansson
 * @copyright Copyright 2017, Licensed GPL & MIT
 */

var MOS = MOS || {};
MOS.HosSpotter = function (targetSelector, opt) {

    var that = this;

    that.target= document.querySelector(targetSelector);
    that.target.insertAdjacentHTML('beforeend', '<div class="hotSpotter-inner"></div>');

    that.container = document.querySelector(targetSelector + ' .hotSpotter-inner');
    that.opt = opt || {};
    that.padding = '5px';
    that.id = 'HosSpotter_' + MOS.HosSpotter.getId();
    that.dots = {};
    that.currentDot = null;
    that.dummyDot = null;
    that.templates = {
        dot: '<div id="{{id}}" class="hotspotter-dot" style="left: {{left}}; top: {{top}};" title="{{title}}"></div>',
        dummydot: '<div id="{{id}}" class="hotspotter-dummy-dot" style="left: {{left}}; top: {{top}};" title="{{title}}"></div>',
        balloon: '<div class="hotspotter-balloon collapsed {{tailPosition}}">{{html}}</div>'
    };
    that.isTouchDevice = ('ontouchstart' in window ||navigator.maxTouchPoints);
    that.trigger = opt.trigger ||  'click';
    that.tailPosition = opt.tailPosition ||  'bottom';
    that.tailOffset = opt.tailOffset ||  10;
    that.balloonElement = null;

    if (that.isTouchDevice && that.trigger === 'click') {
        that.trigger = 'touchstart';
    }

    document.addEventListener('click', function (e) {
        e.preventDefault();
        
        if (that.currentDot) {
            that.currentDot.collapse();
        }

    });

    window.addEventListener('keydown', function(e){
        if((e.key=='Escape'||e.key=='Esc'||e.keyCode==27) && (e.target.nodeName=='BODY')){
            e.preventDefault();
            if (that.currentDot) {
                that.currentDot.collapse();
            }
        }
    }, true);

    window.addEventListener('resize', function(event){
    
        if (that.currentDot) {
            that.currentDot.collapse();
        }

    });

    that.balloonWrapper = that.container.querySelector('.hotspotter-balloon-wrapper');

    if (!that.balloonWrapper) {

        that.balloonWrapper = document.createElement('div');
        that.balloonWrapper.classList.add('hotspotter-balloon-wrapper');
        that.container.appendChild(that.balloonWrapper);

    }
    
    MOS.HosSpotter.all[that.id] = that;

};

MOS.HosSpotter.prototype = {};

MOS.HosSpotter.prototype.addDummyDot = function () {

    var that = this,
        html = MOS.HotSpotDot.tmpl.put(that.templates.dummydot, {
        id: 'hot-spotter-dummy-dot',
        title: '',
        top: '10px',
        left: '10px'
    });

    that.container.insertAdjacentHTML('beforeend', html);
    that.dummyDot = that.container.querySelector('#hot-spotter-dummy-dot');

};

MOS.HosSpotter.prototype.add = function (data) {

    var that = this;
    var dot = new MOS.HotSpotDot(data, that);
    that.dots[dot.id] = dot;
    return dot;

};

MOS.HosSpotter.prototype.destroy = function () {

    var that = this;
    delete MOS.HosSpotter.all[that.id];

};

MOS.HosSpotter.all = {};

MOS.HosSpotter.getId = function () {
    return (parseInt(String(parseInt(Math.random() * 100)) + (new Date().getTime()) + parseInt(Math.random() * 100))).toString(36);
};


// Hotspot Dot Class
MOS.HotSpotDot = function (data, parent) {

    var that = this;
    that.parent = parent;

    var tmpl = null,
        tmpData = null,
        container = that.parent.container;

    that.data = data || {};
    that.left = that.data.left;
    that.top = that.data.top;
    that.info = {};
    that.dotElement = null;
    that.id = 'HotSpotDot_' + MOS.HosSpotter.getId();
    MOS.HotSpotDot.all[that.id] = that;

    if (!data.id) {
        data.id = 'dot_' + MOS.HosSpotter.getId();
    }

    tmpData = {
        id: data.id,
        title: data.title,
        left: data.left,
        top: data.top
    };

    var html = MOS.HotSpotDot.tmpl.put(that.parent.templates.dot, tmpData);
    container.insertAdjacentHTML('beforeend', html);
    that.dotElement = container.querySelector('#' + tmpData.id);
    that.dotSize = that.dotElement.offsetWidth;

    that.dotElement.addEventListener(that.parent.trigger, function (e) {
        e.preventDefault();
        e.stopPropagation();
        that.show(e.target.id);
    });

};

MOS.HotSpotDot.prototype = {};

MOS.HotSpotDot.prototype.show = function () {

    var that = this,
        tailPos = that.parent.tailPosition,
        tmpData,
        tailSize,
        html;

    if (that.isExpaned) {
        return;
    }

    function getTailSize() {

        var computedStyle = window.getComputedStyle(that.parent.balloonElement, ':after');
        var borderWidth = computedStyle.getPropertyValue('border-width');

        if (!borderWidth) {
            borderWidth = computedStyle.borderLeftWidth;
        }

        return parseInt(borderWidth);
        
    }

    if(that.data.html || that.data.action) {

        tmpData = {html: that.data.html, tailPosition: tailPos};
        html = MOS.HotSpotDot.tmpl.put(that.parent.templates.balloon, tmpData);
        that.parent.balloonWrapper.innerHTML = html;
        that.parent.balloonElement = that.parent.balloonWrapper.querySelector('.hotspotter-balloon');
        tailSize = getTailSize();

        
        that.info.width = that.parent.balloonElement.offsetWidth;
        that.info.height = that.parent.balloonElement.offsetHeight;
        that.info.mode = {
            top: {},
            bottom: {},
            left: {},
            right: {},
            center: {}
        };

        that.info.mode.top.left = 'calc(' + that.left + ' - ' + ((that.info.width - (that.dotSize)) * 0.5) + 'px)'; 
        that.info.mode.top.top = 'calc(' + that.top + ' + ' + (tailSize + that.dotSize + that.parent.tailOffset) + 'px)'; 

        that.info.mode.bottom.left = 'calc(' + that.left + ' - ' + ((that.info.width - (that.dotSize)) * 0.5) + 'px)'; 
        that.info.mode.bottom.top = 'calc(' + (that.top) + ' - ' + (that.info.height + tailSize + that.parent.tailOffset) + 'px)';

        that.info.mode.right.left = 'calc(' + that.left + ' - ' + (that.info.width + that.dotSize) + 'px)'; 
        that.info.mode.right.top = 'calc(' + that.top + ' - ' + (that.info.height * 0.5 - that.dotSize * 0.5) + 'px)'; 

        that.info.mode.left.left = 'calc(' + that.left + ' + ' + (that.dotSize + tailSize + that.parent.tailOffset) + 'px)'; 
        that.info.mode.left.top = 'calc(' + that.top + ' - ' + (that.info.height * 0.5 - that.dotSize * 0.5) + 'px)'; 

        that.info.mode.center.left = 'calc(' + that.left + ' - ' + ((that.info.width - (that.dotSize)) * 0.5) + 'px)'; 
        that.info.mode.center.top = 'calc(' + that.top + ' - ' + (that.info.height * 0.5 - that.dotSize * 0.5) + 'px)'; 

        var useThisTailPosition = that.testPosition();
        
        if (useThisTailPosition !== 'none') {

            that.parent.balloonElement.classList.remove(tailPos);
            that.parent.balloonElement.classList.add(useThisTailPosition);
            that.parent.balloonElement.style.left = that.info.mode[useThisTailPosition].left;
            that.parent.balloonElement.style.top = that.info.mode[useThisTailPosition].top;

        } else {

            that.parent.balloonElement.classList.remove(tailPos);
            that.parent.balloonElement.classList.add('none');
            that.parent.balloonElement.style.left = that.parent.padding;
            that.parent.balloonElement.style.right = that.parent.padding;
            that.parent.balloonElement.style.top = that.parent.padding;
            that.parent.balloonElement.style.width = 'auto';

        }
 
        if (that.data.html) {
            that.expand();
        } else if(that.data.action) {
            that.expand(false);
            that.data.action(that);
            that.collapse();
        }

    } else {
        that.collapse();
    }

};

MOS.HotSpotDot.prototype.testPosition = function () {

    var that = this;
    var ww = window.innerWidth;
    var wh = window.innerHeight;
    var tailPos = that.parent.tailPosition;
    var dPos;
    if (!that.parent.dummyDot) that.parent.addDummyDot();
    var dd = that.parent.dummyDot;

    var test = function (tPos) {

        var rect, 
            rv = {
                left: true,
                right: true,
                top: true,
                bottom: true,
                overAll: true
            };

        dd.style.left = that.info.mode[tPos].left;
        dd.style.top = that.info.mode[tPos].top;
        dd.style.width = that.info.width + 'px';
        dd.style.height = that.info.height + 'px';
        rect = dd.getBoundingClientRect();
        
        if (rect.left < 0) {
            rv.left = false;
            rv.overAll = false;
        }

        if (rect.top < 0) {
            rv.top = false;
            rv.overAll = false;
        }

        if (rect.right > ww) {
            rv.right = false;
            rv.overAll = false;
        }

        if (rect.bottom > wh) {
            rv.bottom = false;
            rv.overAll = false;
        }

        return rv;

    };
    
    var testOrder,
        workingPosition = 'none';

    if (tailPos === 'bottom') {
        testOrder = [tailPos, 'top', 'left', 'right', 'center'];
    }
    if (tailPos === 'top') {
        testOrder = [tailPos, 'bottom', 'left', 'right', 'center'];
    }
    if (tailPos === 'left') {
        testOrder = [tailPos, 'right', 'top', 'bottom', 'center'];
    }
    if (tailPos === 'right') {
        testOrder = [tailPos, 'left', 'top', 'bottom', 'center'];
    }
    
    for (var i = 0; i < testOrder.length; i++) {
        
        var testPos = testOrder[i],
            testRes = test(testPos);

        if (testRes.overAll) {
            workingPosition = testPos;
            break;
        }
        
    }

    // if (workingPosition === 'none') {
    //     for (var key in testRes) {
    //         if (testRes[key]) {
    //             workingPosition = key;
    //             break;
    //         }
    //     }
    // }

    //console.log(workingPosition);
    return workingPosition;
    
};

MOS.HotSpotDot.prototype.expand = function (showBalloon) {

    var that = this;

    if (typeof(showBalloon) === 'undefined') {
        showBalloon = true;
    }

    if (that.parent.currentDot) {
        that.parent.currentDot.isExpaned = false;
    }
    
    if (showBalloon) {
        that.parent.balloonElement.classList.remove('collapsed');
    }

    that.parent.currentDot = that;

    that.parent.balloonElement.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    that.isExpaned = true;

};

MOS.HotSpotDot.prototype.collapse = function () {

    var that = this;
    if (that.parent.balloonElement) {
        that.parent.balloonElement.classList.add('collapsed');
        that.parent.currentDot = null;
    }
    that.isExpaned = false;
    if (that.parent.currentDot) {
        that.parent.currentDot.isExpaned = false;
    }

};

MOS.HotSpotDot.prototype.remove = function () {

    var that = this;
    //delete MOS.HotSpotDot.all[that.id];

};

MOS.HotSpotDot.tmpl = {
    startTag: '{{',
    endTag: '}}',
    get: function (id) {
        return document.getElementById(id).innerHTML;
    },
    put: function (pattern, inserts) {
        var rv = pattern,
            prop;
        for (prop in inserts) {
            rv = rv.split(this.startTag + prop + this.endTag).join(inserts[prop]);
        }
        return rv;
    },
    render: function (input, inserts) {
        var pattern = input;
        if (input.indexOf(this.startTag) === -1) {
            pattern = this.get(input);
        }

        var rv = '';
        if (inserts instanceof Array) {
            var len = inserts.length,
                i;
            for (i = 0; i < len; i += 1) {
                rv += this.put(pattern, inserts[i]);
            }
        } else {
            rv = this.put(pattern, inserts);
        }
        return rv;
    }
};

MOS.HotSpotDot.all = {};