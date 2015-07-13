var Window      = require('pex-sys/Window');
var Screen      = require('pex-sys/Screen');
var Draw        = require('pex-draw/Draw');
var OrthoCamera = require('pex-cam/OrthoCamera');
var glslify     = require('glslify-promise');

var frame = 0;

Window.create({
    settings: {
        width: Screen.getWidth()/2,
        height: Screen.getHeight()/2
    },
    init: function() {
    },
    onKeyDown: function(e) {
        console.log('onKeyDown', e.str, e.keyCode, e.altKey, e.shiftKey, e.ctrlKey, e.metaKey);
    },
    onKeyPress: function(e) {
        console.log('onKeyPress', e.str, e.keyCode, e.altKey, e.shiftKey, e.ctrlKey, e.metaKey);
    },
    onKeyUp: function(e) {
        console.log('onKeyUp', e.str, e.keyCode, e.altKey, e.shiftKey, e.ctrlKey, e.metaKey);
    },
    draw: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1.0);
        ctx.clear(ctx.COLOR_BIT);
    }
})
