//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createSphere = require('primitive-sphere');
var glslify     = require('glslify-promise');
var PerspCamera  = require('pex-cam/PerspCamera');
var Arcball      = require('pex-cam/Arcball');

Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    resources: {
        showNormalsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowNormalsInstanced.vert') },
        showNormalsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowNormalsInstanced.frag') }
    },
    init: function() {
        var ctx = this.getContext();

        this.camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this.camera.lookAt([2, 1, 2], [0, 0, 0]);

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.arcball.setDistance(3.0);
        this.addEventListener(this.arcball);

        var res = this.getResources();

        this.program = ctx.createProgram(res.showNormalsVert, res.showNormalsFrag);
        ctx.bindProgram(this.program);

        this.offsets = [];
        this.scales = [];

        for(var i=0; i<10000; i++) {
            this.offsets.push([
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            ])
            this.scales.push(0.1)
        }

        var sphere = createSphere(0.5, { segments: 2 });
        var sphereAttributes = [
            { data: sphere.positions, location: ctx.ATTRIB_POSITION },
            { data: sphere.normals, location: ctx.ATTRIB_NORMAL },
            { data: this.offsets, location: ctx.ATTRIB_CUSTOM_0, divisor: 1 },
            { data: this.scales, location: ctx.ATTRIB_CUSTOM_1, divisor: 1}
        ];
        var sphereIndices = { data: sphere.cells };
        this.sphereMesh = ctx.createMesh(sphereAttributes, sphereIndices);
    },
    draw: function() {
        var ctx = this.getContext();

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        ctx.bindProgram(this.program);
        ctx.bindMesh(this.sphereMesh);
        ctx.drawMesh(10000);
    }
})
