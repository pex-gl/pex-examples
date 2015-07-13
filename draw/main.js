var Window = require('pex-sys/Window');
var Mat4   = require('pex-math/Mat4');
var Draw   = require('pex-draw');
var glslify = require('glslify-promise');

var PerspCamera = require('pex-cam/PerspCamera');

var COLOR_WHITE  = [1,1,1,1];
var COLOR_BLACK  = [0,0,0,1];
var COLOR_RED    = [1,0,0,1];
var COLOR_GREEN  = [0,1,0,1];
var COLOR_BLUE   = [0,0,1,1];
var COLOR_PURPLE = [1,0,1,1];

Window.create({
    settings: {
        width: 800,
        height: 600,
        type: '3d'
    },
    resources: {
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.frag') },
    },
    init: function() {
        var ctx = this.getContext();
        var res = this.getResources();
        var program = ctx.createProgram(res.showColorsVert, res.showColorsFrag);
        ctx.bindProgram(program);
        this.t = 0;

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.setDepthTest(true);

        this.camera = new PerspCamera(45.0,this.getAspectRatio(),0.01,40.0);
        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this._draw = new Draw(ctx);

        this._randomPositionsFlat = new Array(128 * 3);
        this._randomPositions     = new Array(128);
        for(var i = 0, j = 0, l = this._randomPositionsFlat.length, x, y, z; i < l; i+=3, j+=1){
            x = this._randomPositionsFlat[i  ] = -0.5 + Math.random();
            y = this._randomPositionsFlat[i+1] = -0.5 + Math.random();
            z = this._randomPositionsFlat[i+2] = -0.5 + Math.random();
            this._randomPositions[j] = [x,y,z];
        }
    },
    draw: function() {
        var ctx  = this.getContext();
        var draw = this._draw;
        var time = this.t;

        var offset = [2.5,0,0];


        this.camera.lookAt([Math.cos(time * 0.125 * Math.PI) * 10,10,Math.sin(time * 0.125 * Math.PI) * 10],[0,0,0]);
        this.camera.updateViewMatrix();

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setDepthTest(false);
        draw.setColor4(0,0.125,0.125,1);
        draw.drawFullscreenWindowRect(this.getWidth(),this.getHeight(),true);
        ctx.setDepthTest(true);

        ctx.setViewMatrix(this.camera.getViewMatrix());

        draw.setLineWidth(1);
        draw.setColor4(0.0,0.125,0.25,1);
        draw.drawGrid([30,30],30);

        ctx.pushModelMatrix();
            ctx.translate([0,0.0125,0]);
            draw.drawPivotAxes(2);
        ctx.popModelMatrix();


        draw.setColor4(1,0,1,1);
        draw.setLineWidth(1);

        ctx.pushModelMatrix();
            ctx.translate([0,0.5125,0]);
            draw.setColor4(0,0,1,1);
            //draw.drawLineStrip([[0,0,0],[2,0,0],[2,2,0]]);
            ctx.pushModelMatrix();
                ctx.translate([-2.5,0,-5]);
                draw.setLineWidth(5);
                draw.setColor(COLOR_WHITE);
                draw.drawLineStripFlat(this._randomPositionsFlat);
                ctx.translate(offset);
                draw.setLineWidth(1);
                draw.setColor(COLOR_PURPLE);
                draw.drawLineStrip(this._randomPositions);
                ctx.translate(offset);
                draw.setLineWidth(1);
                draw.setColor(COLOR_BLUE);
                draw.drawPoints(this._randomPositions);
                ctx.translate(offset);
                draw.setPointSize(3);
                draw.setColor(COLOR_BLACK);
                draw.drawPoints(this._randomPositions);
            ctx.popModelMatrix();

            ctx.pushModelMatrix();
                ctx.translate([-2.5,0,-2.5]);
                draw.setColor(COLOR_BLACK);
                draw.drawCubeStroked();
                ctx.translate(offset);
                draw.setColor(COLOR_PURPLE);
                draw.drawCubePoints();
                ctx.translate(offset);
                draw.drawCubeColored();
                ctx.translate(offset);
                draw.setColor4(0.5 + Math.sin(time * 10.0) * 0.5,0,0,1);
                draw.drawCube();
            ctx.popModelMatrix();

            ctx.pushModelMatrix();
                ctx.translate([-2.5,0,0]);
                draw.drawRect();
                ctx.translate(offset);
                draw.setColor(COLOR_GREEN);
                draw.drawRectPoints();
                ctx.translate(offset);
                draw.setColor(COLOR_GREEN);
                draw.drawRectStroked();
                ctx.translate(offset);
                draw.setLineWidth(4);
                draw.setColor(COLOR_WHITE);
                draw.drawLines([
                    [[1,0,0],[0,1,0]],
                    [[0,0,0],[1,1,1]]
                ]);
                draw.setColor(COLOR_RED);
                draw.drawLinesFlat([
                    0,0,1,1,0,1
                ]);
            ctx.popModelMatrix();

            ctx.pushModelMatrix();
                ctx.translate([-2.5,0,2.5]);
                draw.setColor(COLOR_GREEN);
                draw.setCircleNumSegments(16);
                draw.drawCircle(1);
                ctx.translate(offset);
                draw.setColor(COLOR_WHITE);
                draw.setLineWidth(1);
                draw.setCircleNumSegments(5);
                draw.drawCircleStroked(1);
            ctx.popModelMatrix();
        ctx.popModelMatrix();

        this.t += 1 / 60;
    }
});
