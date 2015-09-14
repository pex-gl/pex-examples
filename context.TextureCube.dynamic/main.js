//Ported from https://github.com/glo-js/glo-demo-primitive

var Window      = require('pex-sys/Window');
var Mat4        = require('pex-math/Mat4');
var Vec3        = require('pex-math/Vec3');
var createTorus = require('primitive-torus');
var createCube  = require('primitive-cube');
var createSphere = require('primitive-sphere');
var glslify     = require('glslify-promise');
var loadBinary  = require('pex-io/loadBinary');
var PerspCamera = require('pex-cam/PerspCamera');
var Arcball     = require('pex-cam/Arcball');
var Draw        = require('pex-draw');

Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    resources: {
        reflectionVert: { glsl: glslify(__dirname + '/../assets/glsl/CubemapReflection.vert') },
        reflectionFrag: { glsl: glslify(__dirname + '/../assets/glsl/CubemapReflection.frag') },
        solidColorVert: { glsl: glslify(__dirname + '/../assets/glsl/SolidColor.vert') },
        solidColorFrag: { glsl: glslify(__dirname + '/../assets/glsl/SolidColor.frag') },
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.frag') },
    },
    init: function() {
        var ctx = this.getContext();

        this.camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this.camera.lookAt([5,5,5],[0,0,0]);

        this.arcball = new Arcball(this.camera,this.getWidth(),this.getHeight());
        this.addEventListener(this.arcball);

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.debugDraw = new Draw(ctx);

        var res = this.getResources();

        this.reflectionProgram = ctx.createProgram(res.reflectionVert, res.reflectionFrag);
        ctx.bindProgram(this.reflectionProgram);
        this.reflectionProgram.setUniform('uReflectionMap', 0);

        this.solidColorProgram = ctx.createProgram(res.solidColorVert, res.solidColorFrag);
        this.showColorsProgram = ctx.createProgram(res.showColorsVert, res.showColorsFrag);

        var torus = createTorus({ majorRadius: 1, minorRadius: 0.5 });
        torus = createSphere();
        var torusAttributes = [
            { data: torus.positions, location: ctx.ATTRIB_POSITION },
            { data: torus.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: torus.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var torusIndices = { data: torus.cells };
        this.torusMesh = ctx.createMesh(torusAttributes, torusIndices);

        var cube = createCube();
        var cubeAttributes = [
            { data: cube.positions, location: ctx.ATTRIB_POSITION },
            { data: cube.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: cube.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var cubeIndices = { data: cube.cells };
        this.cubeMesh = ctx.createMesh(cubeAttributes, cubeIndices);

        this.cubeInstances = [
            { position: [ 3, 0, 0], scale: [1.0, 1.0, 1.0], color: [1, 0, 0, 1]},
            { position: [-3, 0, 0], scale: [1.0, 1.0, 1.0], color: [1, 0.5, 0, 1]},
            { position: [ 0, 3, 0], scale: [1.0, 1.0, 1.0], color: [0, 1, 0, 1]},
            { position: [ 0,-3, 0], scale: [0.5, 0.5, 0.5], color: [0, 1, 0.5, 1]},
            { position: [ 0, 0, 3], scale: [0.5, 0.5, 0.5], color: [0, 0, 1, 1]},
            { position: [ 0, 0,-3], scale: [0.5, 0.5, 0.5], color: [0.5, 0, 1, 1]}
        ]
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.bindTexture(this.tex, 0);

        ctx.bindProgram(this.reflectionProgram);
        ctx.bindMesh(this.torusMesh);
        ctx.drawMesh();

        ctx.bindProgram(this.solidColorProgram);

        var solidColorProgram = this.solidColorProgram;
        ctx.bindMesh(this.cubeMesh);
        this.cubeInstances.forEach(function(instance) {
            solidColorProgram.setUniform('uColor', instance.color);
            ctx.pushModelMatrix();
            ctx.translate(instance.position);
            ctx.scale(instance.scale);
            ctx.drawMesh();
            ctx.popModelMatrix();
        })

        ctx.bindProgram(this.showColorsProgram);
        this.debugDraw.drawPivotAxes(2)
    }
})
