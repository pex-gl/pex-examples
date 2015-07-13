var sys = require('pex-sys');
var Window = sys.Window;

Window.create({
    settings: {
        width: 1280,
        height: 720
    },
    init: function() {
        console.log('init');
    },
    draw: function() {
        var ctx = this.getContext();

        var frame = this.getTime().getElapsedFrames();
        var seconds = this.getTime().getElapsedSeconds();
        var delta = this.getTime().getDeltaSeconds();
        var fps = this.getTime().getFPS();
        console.log(frame, seconds, delta, fps);

        var r = 0.5 + 0.5 * Math.sin(frame/10);
        var g = 0.5 + 0.5 * Math.cos(frame/10 + Math.PI/2);
        var b = 0.5 + 0.5 * Math.sin(frame/10 + Math.PI/4);
        ctx.setClearColor(r, g, b, 1.0);
        ctx.clear(ctx.COLOR_BIT);
    }
})
