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
var GUI         = require('pex-gui');
var isBrowser   = require('is-browser');

var CUBEMAP_SIZE = 128; //->128 -> 64 -> 32 -> 16

Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d',
        fullscreen: isBrowser
    },
    resources: {
        reflectionVert: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionCubemap.vert') },
        reflectionFrag: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionCubemap.frag') },
        solidColorVert: { glsl: glslify(__dirname + '/../assets/glsl/SolidColor.vert') },
        solidColorFrag: { glsl: glslify(__dirname + '/../assets/glsl/SolidColor.frag') },
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.vert') },
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.frag') },
    },
    init: function() {
        var ctx = this.getContext();

        this.gui = new GUI(ctx, this.getWidth(), this.getHeight());
        this.addEventListener(this.gui);
        this.gui.addHeader('Preview');

        this.camera  = new PerspCamera(45,this.getAspectRatio(),0.001,20.0);
        this.camera.lookAt([2,4,-7],[0,0,0]);

        this.arcball = new Arcball(this.camera,this.getWidth(),this.getHeight());
        this.addEventListener(this.arcball);

        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.debugDraw = new Draw(ctx);

        var res = this.getResources();

        this.reflectionProgram = ctx.createProgram(res.reflectionVert, res.reflectionFrag);
        ctx.bindProgram(this.reflectionProgram);
        this.reflectionProgram.setUniform('uReflectionMap', 0);
        this.reflectionProgram.setUniform('uReflectionMapFlipEnvMap', 1);

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
            { position: [ 3, 0, 0], scale: 1.0, color: [1.0, 0.0, 0.0, 1.0]},
            { position: [-3, 0, 0], scale: 1.0, color: [1.0, 0.5, 0.0, 1.0]},
            { position: [ 0, 3, 0], scale: 1.0, color: [0.0, 0.8, 0.0, 1.0]},
            { position: [ 0,-3, 0], scale: 0.5, color: [0.0, 0.8, 0.8, 1.0]},
            { position: [ 0, 0, 3], scale: 0.5, color: [0.0, 0.0, 1.0, 1.0]},
            { position: [ 0, 0,-3], scale: 0.5, color: [0.5, 0.0, 1.0, 1.0]}
        ];

        this.reflectionMap = ctx.createTextureCube(null, CUBEMAP_SIZE, CUBEMAP_SIZE, { flipEnvMap: 1 });

        this.fbo = ctx.createFramebuffer();

        this.gui.addTextureCube('Reflection', this.reflectionMap);

        this.cubeMapProjection = Mat4.perspective(Mat4.create(), 45, 1, 0.001, 50.0);
        this.cubeMapView = Mat4.lookAt([], [0, 0, 0], [1, 0, 0], [0, 1, 0]);
    },
    seconds: 0,
    prevTime: Date.now(),
    updateCubemap: function() {
        var ctx = this.getContext();

        var sides = [
            { bg: [1.0, 0.0, 0.0, 1.0], bg: [1.0/10, 0.0/10, 0.0/10, 1.0], eye: [0, 0, 0], target: [ 1, 0, 0], up: [0, 1, 0] },
            { bg: [1.0, 0.5, 0.0, 1.0], bg: [1.0/10, 0.5/10, 0.0/10, 1.0], eye: [0, 0, 0], target: [-1, 0, 0], up: [0, 1, 0] },
            { bg: [0.0, 0.8, 0.0, 1.0], bg: [0.0/10, 0.8/10, 0.0/10, 1.0], eye: [0, 0, 0], target: [0,  1, 0], up: [0, 0, 1] },
            { bg: [0.0, 0.8, 0.8, 1.0], bg: [0.0/10, 0.8/10, 0.8/10, 1.0], eye: [0, 0, 0], target: [0, -1, 0], up: [0, 0, 1] },
            { bg: [0.0, 0.0, 1.0, 1.0], bg: [0.0/10, 0.0/10, 1.0/10, 1.0], eye: [0, 0, 0], target: [0, 0,  1], up: [0, 1, 0] },
            { bg: [0.5, 0.0, 1.0, 1.0], bg: [0.5/10, 0.0/10, 1.0/10, 1.0], eye: [0, 0, 0], target: [0, 0, -1], up: [0, 1, 0] },
        ]

        var gl = ctx.getGL();

        ctx.pushState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.MATRIX_MODEL_BIT);
        ctx.setViewport(0, 0, CUBEMAP_SIZE, CUBEMAP_SIZE);
        ctx.bindFramebuffer(this.fbo);
        ctx.setProjectionMatrix(this.cubeMapProjection);
        //We need to mirror the scene to match Left-Handed coordinate system of the cubemap
        sides.forEach(function(side, sideIndex) {
            this.fbo.setColorAttachment(0, ctx.TEXTURE_CUBE_MAP_POSITIVE_X + sideIndex, this.reflectionMap.getHandle(), 0);
            ctx.setClearColor(side.bg[0], side.bg[1], side.bg[2], side.bg[3]);
            ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
            Mat4.lookAt(this.cubeMapView, side.eye, side.target, side.up);
            ctx.setViewMatrix(this.cubeMapView);
            this.drawScene();
        }.bind(this))
        ctx.popState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.MATRIX_MODEL_BIT);
    },
    drawScene: function() {
        var ctx = this.getContext();
        ctx.bindProgram(this.solidColorProgram);
        var solidColorProgram = this.solidColorProgram;
        ctx.bindMesh(this.cubeMesh);

        var tmp = this.tmp = this.tmp || [0, 0, 0];
        var t = this.getTime().getElapsedSeconds();
        this.cubeInstances.forEach(function(instance, i) {
            solidColorProgram.setUniform('uColor', instance.color);
            ctx.pushModelMatrix();
            ctx.translate(instance.position);
            var s = instance.scale + 0.5 * Math.sin(t*2 + i);
            Vec3.set3(tmp, s, s, s);
            ctx.scale(tmp);
            ctx.drawMesh();
            ctx.popModelMatrix();
        })
    },
    draw: function() {
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        this.updateCubemap();

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        ctx.bindTexture(this.reflectionMap, 0);

        ctx.bindProgram(this.reflectionProgram);
        ctx.bindMesh(this.torusMesh);
        ctx.drawMesh();

        this.drawScene();

        ctx.bindProgram(this.showColorsProgram);
        this.debugDraw.drawPivotAxes(2);

        this.gui.draw();
    }
})
