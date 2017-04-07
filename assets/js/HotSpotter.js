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
    
    that.id = 'HosSpotter_' + MOS.HosSpotter.getId();
    that.dots = {};
    that.currentDot = null;
    that.templates = {
        dot: '<div id="{{id}}" class="hotspotter-dot" style="left: {{left}}; top: {{top}};" title="{{title}}"></div>',
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

    that.balloonWrapper = that.container.querySelector('.hotspotter-balloon-wrapper');

    if (!that.balloonWrapper) {

        that.balloonWrapper = document.createElement('div');
        that.balloonWrapper.classList.add('hotspotter-balloon-wrapper');
        that.container.appendChild(that.balloonWrapper);

    }
    
    MOS.HosSpotter.all[that.id] = that;

};

MOS.HosSpotter.prototype = {};

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

    var tmpl = null;
    var tmpData = null;
    var container = that.parent.container;

    that.data = data || {};

    that.left = that.data.left;
    that.top = that.data.top;
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

    var html = that.tmpl.put(that.parent.templates.dot, tmpData);
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

    if(that.data.html) {

        tmpData = {html: that.data.html, tailPosition: tailPos};
        html = that.tmpl.put(that.parent.templates.balloon, tmpData);
        that.parent.balloonWrapper.innerHTML = html;
        that.parent.balloonElement = that.parent.balloonWrapper.querySelector('.hotspotter-balloon');
        tailSize = getTailSize();
        that.width = that.parent.balloonElement.offsetWidth;
        that.height = that.parent.balloonElement.offsetHeight;
        
        if (tailPos === 'top') {
            that.parent.balloonElement.style.left = 'calc(' + that.left + ' - ' + ((that.width - (that.dotSize - 2)) * 0.5) + 'px)'; 
            that.parent.balloonElement.style.top = 'calc(' + that.top + ' + ' + ((tailSize * 2) + that.parent.tailOffset) + 'px)'; 
        }

        that.expand();

    } else {
        that.collapse();
    }

    if(that.data.action) {
        that.data.action(that);
    }

};

MOS.HotSpotDot.prototype.expand = function () {

    var that = this;

    if (that.parent.currentDot) {
        that.parent.currentDot.isExpaned = false;
    }
    
    that.parent.balloonElement.classList.remove('collapsed');
    that.parent.currentDot = that;   
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

MOS.HotSpotDot.prototype.tmpl = {
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