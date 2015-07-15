var Window = require('pex-sys/Window');
var Draw   = require('pex-draw');
var Rect   = require('pex-geom/Rect');
var Vec3   = require('pex-math/Vec3');
var Mat4   = require('pex-math/Mat4');

Window.create({
    settings : {
        width : 800,
        height : 600
    },
    resources : {
        vert : {text : __dirname + '/../assets/glsl/ShowColors.vert'},
        frag : {text : __dirname + '/../assets/glsl/ShowColors.frag'}
    },
    init : function(){
        var ctx = this.getContext();
        var resources = this.getResources();

        this._program = ctx.createProgram(resources.vert, resources.frag);
        ctx.bindProgram(this._program);

        this._draw = new Draw(ctx);

        ctx.setClearColor(0.125,0.125,0.125, 1);
        ctx.setProjectionMatrix(Mat4.ortho(Mat4.create(),0,this.getWidth(),this.getHeight(),0,-1,1));

        this._points = [[],[],[],[]];
        this._rects  = [Rect.create(),Rect.create(),Rect.create(),Rect.create()];
    },
    draw : function(){
        var ctx          = this.getContext();
        var draw         = this._draw;
        var windowWidth  = this.getWidth();
        var windowHeight = this.getHeight();
        var points = this._points;
        var rects  = this._rects;

        var elapsedFrames = this.getTime().getElapsedFrames();

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        function createRandomPoints(scale,out){
            out.length = Math.floor(Math.random() * 1000) * 2;
            var center = [(-0.5 + Math.random()) * windowWidth * 0.5,(-0.5 + Math.random()) * windowHeight * 0.5];

            for(var i = 0, l = out.length; i < l; i+=2){
                out[i  ] = center[0] + (-0.5 + Math.random()) * scale;
                out[i+1] = center[1] + (-0.5 + Math.random()) * scale;
            }

            return out;
        }

        function updatePoints(){
            createRandomPoints(100,points[0]);
            createRandomPoints( 75,points[1]);
            createRandomPoints( 50,points[2]);
            createRandomPoints( 25,points[3]);
            for(var i = 0, l = points.length; i < l; ++i){
                Rect.includePointsFlat(Rect.setEmpty(rects[i]),points[i]);
            }
        }

        function drawPoints2d(points){
            var temp = Vec3.create();
            for(var i = 0, l = points.length; i < l; i+=2){
                temp[0] = points[i  ];
                temp[1] = points[i+1];
                ctx.pushModelMatrix();
                    ctx.translate(temp);
                    draw.drawCircle(2);
                ctx.popModelMatrix();
            }
        }

        function drawBoundingRect(rect){
            if(Rect.isEmpty(rect)){
                return;
            }
            ctx.pushModelMatrix();
                ctx.translate([rect[0][0], rect[0][1], 0]);
                draw.drawRectStroked(Rect.getWidth(rect), Rect.getHeight(rect));
                var center = Rect.getCenter(rect);
                center = [center[0], center[1], 0];
                ctx.translate(center);
                draw.setColor4(1, 0, 0, 1);
                draw.drawCircle(4);
            ctx.popModelMatrix();
        }

        ctx.loadIdentity();
        ctx.translate([windowWidth * 0.5, windowHeight * 0.5, 0]);

        ctx.pushModelMatrix();
            ctx.rotateXYZ([Math.PI * 0.5,0,0]);
            draw.setColor4(0.075,0.075,0.075,1);
            draw.drawGrid([windowWidth,windowWidth],40);
        ctx.popModelMatrix();

        if(elapsedFrames == 0 || (elapsedFrames % 10 == 0)){
            updatePoints();
        }

        draw.setColor4(1, 1, 1, 1);
        drawPoints2d(points[0]);
        draw.setColor4(0, 0, 1, 1);
        drawBoundingRect(rects[0]);

        draw.setColor4(1, 0, 1, 1);
        drawPoints2d(points[1]);
        draw.setColor4(0, 1, 1, 1);
        drawBoundingRect(rects[1]);

        draw.setColor4(1,0,0,1);
        drawPoints2d(points[2]);
        draw.setColor4(1,1,0,1);
        drawBoundingRect(rects[2]);

        draw.setColor4(0,1,1,1);
        drawPoints2d(points[3]);
        draw.setColor4(1,0,1,1);
        drawBoundingRect(rects[3]);

        var rectAll = Rect.createFromRects(rects);
        draw.setColor4(1, 1, 1, 1);
        drawBoundingRect(rectAll);
    }
});
