var sys = require('pex-sys');
var Window = sys.Window;
var Screen = sys.Screen;

var frame = 0;

Window.create({
    settings: {
        width: Screen.getWidth() - 50,
        height: Screen.getHeight() - 50
    },
    init: function() {
        var numScreens = Screen.getNumScreens();
        for(var i=0; i<numScreens; i++) {
            console.log('Screen', i, Screen.getWidth(i), Screen.getHeight(i), Screen.getDevicePixelRatio(i));
        }
    },
    draw: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.3, 0.75, 0.5, 1.0);
        ctx.clear(ctx.COLOR_BIT);
    }
})
