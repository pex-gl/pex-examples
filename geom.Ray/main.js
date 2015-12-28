var Window      = require('pex-sys/Window');
var PerspCamera = require('pex-cam/PerspCamera');
var Draw        = require('pex-draw');
var Vec3        = require('pex-math/Vec3');
var Plane       = require('pex-geom/Plane');
var Ray         = require('pex-geom/Ray');
var glslify     = require('glslify-promise');

Window.create({
    settings : {
        width  : 800,
        height : 600
    },
    resources : {
        vert : { glsl : glslify(__dirname + '/../assets/glsl/ShowColors.vert') },
        frag : { glsl : glslify(__dirname + '/../assets/glsl/ShowColors.frag') }
    },
    init : function(){
        var ctx       = this.getContext();
        var resources = this.getResources();

        this._program = ctx.createProgram(resources.vert,resources.frag);
        ctx.bindProgram(this._program);

        this._camera  = new PerspCamera(45,this.getAspectRatio(),0.0001,20.0);
        this._camera.lookAt([0,0,0],[3,3,3]);

        this._draw = new Draw(ctx);

        ctx.setClearColor(0.125,0.125,0.125,1);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this._camera.getProjectionMatrix());

        this._planes = new Array(3);
        for(var i = 0, l = this._planes.length; i < l; ++i){
            this._planes[i] = Plane.create();
        }

        this._ray = Ray.create();
        this._ray[1] = [0.0001,1,0];
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
        draw.setColor4(0.0625,0.0625,0.0625,1);
        draw.drawGrid([5,5],20);

        if(frame == 0 || frame % 120 === 0){
            for(var i = 0, l = this._planes.length; i < l; ++i){
                var angle = Math.random() * Math.PI * 2;
                Vec3.set3(this._planes[i][0],
                    Math.cos(angle),
                    0,
                    Math.sin(angle)
                );
                Vec3.set3(this._planes[i][1],
                    Math.cos(angle),
                    0,
                    Math.sin(angle)
                );
            }
        }

        for(var i = 0, l = this._planes.length; i < l; ++i){
            draw.debugPlane(this._planes[i]);
        }

        angle = time * Math.PI * 0.25;

        Vec3.normalize(Vec3.set3(this._ray[1],
            Math.cos(angle) * 0.45,
            Math.sin(time)  * 0.125,
            Math.sin(angle) * 0.45)
        );

        draw.debugRay(this._ray,true);

        for(var i = 0, l = this._planes.length, plane, planePoint, point; i < l; ++i){
            plane      = this._planes[i];
            planePoint = plane[0];
            point      = Plane.getRayIntersection(plane,this._ray);

            if(point === null){
                continue;
            }

            draw.setColor4(1,0,0,1);
            draw.drawLine(planePoint,point,1);

            ctx.pushModelMatrix();
                ctx.translate(point);
                draw.setColor4(1,1,1,1);
                draw.drawCube(0.05);
            ctx.popModelMatrix();
        }
    }
});
