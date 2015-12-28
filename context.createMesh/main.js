//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createTorus = require('primitive-torus');
var glslify     = require('glslify-promise');
var isBrowser   = require('is-browser');

Window.create({
    settings: {
        width: 800,
        height: 600,
        fullScreen: isBrowser
    },
    resources: {
        vert: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.vert') },
        frag: { glsl: glslify(__dirname + '/../assets/glsl/RepeatedTexture.frag') }
    },
    init: function() {
        var ctx = this.getContext();

        if (isBrowser) {
            //normally you would do it with CSS
            document.body.style.margin = '0';
        }

        this.model = Mat4.create();
        this.projection = Mat4.perspective(Mat4.create(), 45, this.getAspectRatio(), 0.001, 10.0);
        this.view = Mat4.lookAt([], [3, 2, 2], [0, 0, 0], [0, 1, 0]);

        ctx.setProjectionMatrix(this.projection);
        ctx.setViewMatrix(this.view);
        ctx.setModelMatrix(this.model);

        var res = this.getResources();

        this.program = ctx.createProgram(res.vert, res.frag);
        ctx.bindProgram(this.program);
        this.program.setUniform('uRepeat', [ 8, 8 ]);
        this.program.setUniform('uTexture', 0);

        var torus = createTorus();

        var attributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var indices = { data: torus.cells, usage: ctx.STATIC_DRAW };
        this.mesh = ctx.createMesh(attributes, indices);

        var img = new Uint8Array([
            0xff, 0xff, 0xff, 0xff, 0xcc, 0xcc, 0xcc, 0xff,
            0xcc, 0xcc, 0xcc, 0xff, 0xff, 0xff, 0xff, 0xff
        ]);

        this.tex = ctx.createTexture2D(img, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST
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

        ctx.setViewMatrix(Mat4.lookAt9(this.view,
                Math.cos(time * Math.PI) * 5,
                Math.sin(time * 0.5) * 0,
                Math.sin(time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        ctx.bindTexture(this.tex, 0);
        ctx.bindProgram(this.program);

        ctx.setViewMatrix(this.view)

        ctx.bindMesh(this.mesh);
        ctx.drawMesh();
    }
})
