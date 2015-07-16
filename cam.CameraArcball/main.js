var Window        = require('pex-sys/Window');
var PerspCamera   = require('pex-cam/PerspCamera');
var CameraArcball = require('pex-cam/CameraArcball');
var Draw          = require('pex-draw');
var Vec3          = require('pex-math/Vec3');

var DEFAULT_EYE    = [0,3,-3];
var DEFAULT_TARGET = [0,0,0];

Window.create({
    settings : {
        width  : 800,
        height : 600
    },
    resources : {
        vert : {text : __dirname + '/../assets/glsl/ShowColors.vert' },
        frag : {text : __dirname + '/../assets/glsl/ShowColors.frag' }
    },
    init : function(){
        var ctx       = this.getContext();
        var resources = this.getResources();

        this._program = ctx.createProgram(resources.vert,resources.frag);
        ctx.bindProgram(this._program);

        this._camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this._camera.lookAt(DEFAULT_EYE,DEFAULT_TARGET);

        this._arcball = new CameraArcball(this._camera,this.getWidth(),this.getHeight());
        this._draw    = new Draw(ctx);

        ctx.setClearColor(0.125,0.125,0.125,1);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this._camera.getProjectionMatrix());

        this.addEventListener(this._arcball);
    },
    onKeyPress : function(e){
        if(e.str == ' '){
            this._arcball.resetPanning();
            return;
        }
        switch (+e.str){
            case 1:
                this._arcball.setLookDirection([1,0,0]);
                break;
            case 2:
                this._arcball.setLookDirection([0,1,0]);
                break;
            case 3:
                this._arcball.setLookDirection([0,0,1]);
                break;
            case 4:
                this._arcball.setLookDirection([1,1,1]);
                break;
            case 5:
                this._arcball.setLookDirection([-1,-1,-1]);
                break;
        }
    },
    draw : function(){
        var ctx  = this.getContext();
        var draw = this._draw;

        if(!this._arcball.isEnabled()){
            this._camera.lookAt(DEFAULT_EYE,DEFAULT_TARGET,[0,1,0]);
        }
        else{
            this._arcball.apply();
        }

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setViewMatrix(this._camera.getViewMatrix());
        draw.drawPivotAxes();
        draw.drawCubeColored(0.25);

        draw.drawArcball(this._arcball,true);
    }
});
