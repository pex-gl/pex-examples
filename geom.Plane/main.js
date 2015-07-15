var Window      = require('pex-sys/Window');
var PerspCamera = require('pex-cam/PerspCamera');
var Draw        = require('pex-draw');
var Vec3        = require('pex-math/Vec3');
var Plane       = require('pex-geom/Plane');

Window.create({
    settings : {
        width  : 800,
        height : 600
    },
    resources : {
        vert : {text : '../assets/glsl/ShowColors.vert' },
        frag : {text : '../assets/glsl/ShowColors.frag' }
    },
    init : function(){
        var ctx       = this.getContext();
        var resources = this.getResources();

        this._program = ctx.createProgram(resources.vert,resources.frag);
        ctx.bindProgram(this._program);

        this._camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this._camera.lookAt([0,0,0],[3,3,3]);

        this._draw = new Draw(ctx);

        ctx.setClearColor(0.125,0.125,0.125,1);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this._camera.getProjectionMatrix());

        this._planes = new Array(8);
        for(var i = 0, l = this._planes.length; i < l; ++i){
            this._planes[i] = Plane.create();
        }
    },
    draw : function(){
        var ctx   = this.getContext();
        var draw  = this._draw;

        var time     = this.getTime().getElapsedSeconds();
        var frame    = this.getTime().getElapsedFrames();
        var angle    = time * Math.PI * 0.125 - Math.PI * 0.5;
        var distance = 5;

        this._camera.lookAt([Math.cos(angle) * distance,distance,Math.sin(angle) * distance],[0,0,0],[0,1,0]);

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setViewMatrix(this._camera.getViewMatrix());
        draw.drawGrid([5,5],20);

        if(frame == 0 || frame % 20 === 0){
            for(var i = 0, l = this._planes.length; i < l; ++i){
                Vec3.set3(this._planes[i][0],
                    (-0.5 + Math.random()) * 5,
                    (-0.5 + Math.random()) * 5,
                    (-0.5 + Math.random()) * 5
                );
                Vec3.set3(this._planes[i][1],
                    (-0.5 + Math.random()) * 2,
                    (-0.5 + Math.random()) * 2,
                    (-0.5 + Math.random()) * 2
                );
            }
        }

        for(var i = 0, l = this._planes.length; i < l; ++i){
            draw.debugPlane(this._planes[i]);
        }
    }
});
