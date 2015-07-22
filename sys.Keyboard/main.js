var Window      = require('pex-sys/Window');
var Screen      = require('pex-sys/Screen');
var Draw        = require('pex-draw/Draw');
var OrthoCamera = require('pex-cam/OrthoCamera');
var glslify     = require('glslify-promise');
var KeyboardEvent = require('pex-sys/KeyboardEvent');

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

        switch(e.keyCode) {
            case KeyboardEvent.VK_BACKSPACE: console.log('backspace'); break;
            case KeyboardEvent.VK_ENTER: console.log('enter'); break;
            case KeyboardEvent.VK_SPACE: console.log('space'); break;
            case KeyboardEvent.VK_DELETE: console.log('delete'); break;
            case KeyboardEvent.VK_TAB: console.log('tab'); break;
            case KeyboardEvent.VK_ESC: console.log('esc'); break;
            case KeyboardEvent.VK_UP: console.log('up'); break;
            case KeyboardEvent.VK_DOWN: console.log('down'); break;
            case KeyboardEvent.VK_LEFT: console.log('left'); break;
            case KeyboardEvent.VK_RIGHT: console.log('right'); break;
        }
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
