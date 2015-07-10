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
    resources: {
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.frag') },
    },
    mousePos: [0, 0],
    mouseColor: [1, 0, 0, 0],
    mouseDownColor: [1, 1, 0, 0],
    mouseDown: false,
    mouseSize: 80,
    mouseDownSize: 120,
    init: function() {
        var ctx = this.getContext();
        var res = this.getResources();

        this.camera = new OrthoCamera(this.getWidth(), this.getHeight())
        this.camera.setOrtho(0, this.getWidth(), this.getHeight(), 0, -10, 10);

        this.draw = new Draw(ctx);
        this.program = ctx.createProgram(res.showColorsVert, res.showColorsFrag);
    },
    onMouseDown: function(e) {
        this.mouseDown = true;
    },
    onMouseUp: function(e) {
        this.mouseDown = false;
    },
    onMouseMove: function(e) {
        this.mousePos[0] = e.x;
        this.mousePos[1] = e.y;
    },
    onMouseDrag: function(e) {
        this.mousePos[0] = e.x;
        this.mousePos[1] = e.y;
    },
    onMouseScroll: function(e) {
        console.log(e.dx, e.dy)
    },
    draw: function() {
        var ctx = this.getContext();

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.setClearColor(0.2, 0.2, 0.2, 1.0);

        ctx.clear(ctx.COLOR_BIT);

        var size = this.mouseDown ? this.mouseDownSize : this.mouseSize;

        ctx.bindProgram(this.program);
        ctx.pushModelMatrix();
        ctx.translate([this.mousePos[0] - size/2, this.mousePos[1] - size/2, 0]);
        this.draw.setColor(this.mouseDown ? this.mouseDownColor : this.mouseColor)
        this.draw.drawRect(size, size);
        ctx.popModelMatrix();
    }
})
