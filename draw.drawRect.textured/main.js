var Window      = require('pex-sys/Window');
var Screen      = require('pex-sys/Screen');
var Draw        = require('pex-draw/Draw');
var OrthoCamera = require('pex-cam/OrthoCamera');
var glslify     = require('glslify-promise');
var random      = require('pex-random');

var frame = 0;

Window.create({
    settings: {
        width: Screen.getWidth()/2,
        height: Screen.getHeight()/2
    },
    resources: {
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/Textured.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/Textured.frag') },
        plaskImage: { image: __dirname + '/../assets/textures/plask.png'}
    },
    mousePos: [0, 0],
    mouseColor: [1, 0, 0, 1],
    mouseDownColor: [1, 1, 0, 1],
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
        this.texture = ctx.createTexture2D(res.plaskImage);

        var w = this.getWidth();
        var h = this.getHeight();

        this.rectangles = [];
        for(var i=0; i<10; i++) {
            var x = random.int(0, w);
            var y = random.int(0, h);
            var rectSize = random.int(20, 100);
            this.rectangles.push([[x, y], [x + rectSize, y + rectSize]]);
        }
    },
    draw: function() {
        var ctx = this.getContext();

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.setClearColor(0.2, 0.2, 0.2, 1.0);

        ctx.clear(ctx.COLOR_BIT);

        var size = this.mouseDown ? this.mouseDownSize : this.mouseSize;

        ctx.bindTexture(this.texture);
        ctx.bindProgram(this.program);
        ctx.pushModelMatrix();
        this.draw.setColor([1, 1, 1, 1]);
        this.rectangles.forEach(function(rect) {
            ctx.pushModelMatrix();
            ctx.translate([rect[0][0], rect[0][1], 0]);
            this.draw.drawRect(rect[1][0] - rect[0][0], rect[1][1] - rect[0][1]);
            ctx.popModelMatrix();
        }.bind(this))

        ctx.popModelMatrix();
    }
})
