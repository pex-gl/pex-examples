//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createCube = require('primitive-cube');
var glslify     = require('glslify-promise');
var isBrowser   = require('is-browser');
var PerspCamera = require('pex-cam/PerspCamera');
var Arcball     = require('pex-cam/Arcball');


Window.create({
    settings: {
        width: 1200,
        height: 400,
        fullScreen: isBrowser
    },
    resources: {
        vert: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.vert') },
        frag: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.frag') },
        testcard: { image: __dirname + '/../assets/textures/testcard.jpg'}
    },
    init: function() {
        var ctx = this.getContext();

        if (isBrowser) {
            //normally you would do it with CSS
            document.body.style.margin = '0';
        }

        this.camera  = new PerspCamera(45,this.getAspectRatio()/3,0.001,20.0);
        this.camera.lookAt([2, 2, 2],[0,0,0]);

        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.addEventListener(this.arcball);

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());
        ctx.setViewMatrix(this.camera.getViewMatrix())

        var res = this.getResources();

        this.program = ctx.createProgram(res.vert, res.frag);
        ctx.bindProgram(this.program);
        this.program.setUniform('uRepeat', [ 1, 1 ]);
        this.program.setUniform('uTexture', 0);

        var torus = createCube();

        var attributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var indices = { data: torus.cells, usage: ctx.STATIC_DRAW };
        this.mesh = ctx.createMesh(attributes, indices);

        this.texNearest = ctx.createTexture2D(res.testcard, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST
        })

        this.texLinear = ctx.createTexture2D(res.testcard, 2, 2, {
          repeat: true,
          minFilter: ctx.LINEAR,
          magFilter: ctx.LINEAR
        })

        this.texMipmap = ctx.createTexture2D(res.testcard, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST,
          mipmap: true
        })
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        if (!this.mesh) return;
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var time = Date.now()/1000;

        ctx.bindProgram(this.program);

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.bindMesh(this.mesh);

        ctx.bindTexture(this.texNearest);
        ctx.setViewport(0, 0, this.getWidth()/3, this.getHeight())
        ctx.drawMesh();

        ctx.bindTexture(this.texLinear);
        ctx.setViewport(this.getWidth()/3, 0, this.getWidth()/3, this.getHeight())
        ctx.drawMesh();

        ctx.bindTexture(this.texMipmap);
        ctx.setViewport(2*this.getWidth()/3, 0, this.getWidth()/3, this.getHeight())
        ctx.drawMesh();
    }
})
