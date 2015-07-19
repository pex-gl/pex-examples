var Window      = require('pex-sys/Window');
var PerspCamera = require('pex-cam/PerspCamera');
var Arcball     = require('pex-cam/Arcball');
var Draw        = require('pex-draw');

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
        this._camera.lookAt([3,3,3],[0,0,0]);

        this._arcball = new Arcball(this._camera,this.getWidth(),this.getHeight());
        this._arcballState = this._arcball.getState();

        this._draw = new Draw(ctx);

        ctx.setClearColor(0.125,0.125,0.125,1);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this._camera.getProjectionMatrix());

        this.addEventListener(this._arcball);
    },
    onKeyPress : function(e){
        switch (e.str){
            case ' ':
                this._arcball.resetPanning();
                break;
            case 's':
                this._arcballState = this._arcball.getState();
                break;
            case 'l':
                this._arcball.setState(this._arcballState);
                break;
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

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        this._arcball.apply();
        ctx.setViewMatrix(this._camera.getViewMatrix());

        ctx.pushModelMatrix();
            ctx.scale([0.5,0.125,0.5]);
            draw.drawCubeColored();
        ctx.popModelMatrix();

        draw.debugArcball(this._arcball,true);
    }
});
