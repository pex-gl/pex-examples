var sys = require('pex-sys');
var Window = sys.Window;
var Screen = sys.Screen;

var frame = 0;

Window.create({
    settings: {
        width: Screen.getWidth()/2,
        height: Screen.getHeight()/2
    },
    init: function() {
    },
    draw: function() {
        var ctx = this.getContext();
        ctx.setClearColor(this.getMouse().getX() / this.getWidth(), this.getMouse().getY() / this.getHeight(), 0.5, 1.0);
        console.log(this.getMouse().getX(), this.getMouse().getY())
        ctx.clear(ctx.COLOR_BIT);
    }
})
