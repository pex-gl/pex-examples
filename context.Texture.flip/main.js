var Window = require('pex-sys/Window');
var Mat4 = require('pex-math/Mat4');
var Vec3 = require('pex-math/Vec3');
var isBrowser = require('is-browser');
var PerspCamera = require('pex-cam/PerspCamera');
var Arcball = require('pex-cam/Arcball');
var glslify = require('glslify-promise');
var createSphere = require('primitive-sphere');
var Draw = require('pex-draw');
var GUI = require('pex-gui');

var ASSETS_DIR = isBrowser ? '../assets' :  __dirname + '/../assets';


//Flipping up by -1 inspired by http://www.mbroecker.com/project_dynamic_cubemaps.html
var sides = [
    { eye: [0, 0, 0], target: [ 1, 0, 0], up: [0, -1,  0], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [-1, 0, 0], up: [0, -1,  0], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0,  1, 0], up: [0,  0,  1], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, -1, 0], up: [0,  0, -1], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, 0,  1], up: [0, -1,  0], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, 0, -1], up: [0, -1,  0], color: [0, 0, 0, 1] },
];

var fbo = null;
var projectionMatrix = null;
var viewMatrix = null;

function renderToCubemap(ctx, cubemap, drawScene, level) {
    level = level || 0;
    if (!fbo) {
        fbo = ctx.createFramebuffer();
        projectionMatrix = Mat4.perspective(Mat4.create(), 90, 1, 0.001, 500.0);
        viewMatrix = Mat4.create();
    }

    ctx.pushState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.MATRIX_MODEL_BIT | ctx.COLOR_BIT);
    ctx.setViewport(0, 0, cubemap.getWidth(), cubemap.getHeight());
    ctx.bindFramebuffer(fbo);
    ctx.setProjectionMatrix(projectionMatrix);
    sides.forEach(function(side, sideIndex) {
        fbo.setColorAttachment(0, ctx.TEXTURE_CUBE_MAP_POSITIVE_X + sideIndex, cubemap.getHandle(), level);
        ctx.setClearColor(side.color[0], side.color[1], side.color[2], 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        Mat4.lookAt(viewMatrix, side.eye, side.target, side.up);
        ctx.setViewMatrix(viewMatrix);
        drawScene();
    })
    ctx.popState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.MATRIX_MODEL_BIT  | ctx.COLOR_BIT);
}

Window.create({
    settings: {
        width: 1200,
        height: 900
    },
    resources: {
        reflectionCubemapVert: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionCubemap.vert') },
        reflectionCubemapFrag: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionCubemap.frag') },
        reflectionEquirectVert: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionEquirect.vert') },
        reflectionEquirectFrag: { glsl: glslify(__dirname + '/../assets/glsl/ReflectionEquirect.frag') },
        texturedVert: { glsl: glslify(__dirname + '/../assets/glsl/Textured.vert')},
        texturedFrag: { glsl: glslify(__dirname + '/../assets/glsl/Textured.frag')},
        showTexCoordsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowTexCoords.vert')},
        showTexCoordsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowTexCoords.frag')},
        showColorsVert: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.vert')},
        showColorsFrag: { glsl: glslify(__dirname + '/../assets/glsl/ShowColors.frag')},
        envMap_px: { image: ASSETS_DIR + '/cubemaps/pisa_posx.jpg' },
        envMap_nx: { image: ASSETS_DIR + '/cubemaps/pisa_negx.jpg' },
        envMap_py: { image: ASSETS_DIR + '/cubemaps/pisa_posy.jpg' },
        envMap_ny: { image: ASSETS_DIR + '/cubemaps/pisa_negy.jpg' },
        envMap_pz: { image: ASSETS_DIR + '/cubemaps/pisa_posz.jpg' },
        envMap_nz: { image: ASSETS_DIR + '/cubemaps/pisa_negz.jpg' },
        pisaPreview: { image: ASSETS_DIR + '/cubemaps/pisa_preview.jpg' },
        var: { image: ASSETS_DIR + '/textures/var.png' },
        skyboxCubemapVert: { glsl: glslify(__dirname + '/../assets/glsl/SkyboxCubemap.vert')},
        skyboxCubemapFrag: { glsl: glslify(__dirname + '/../assets/glsl/SkyboxCubemap.frag')},
        skyboxEnvMapVert: { glsl: glslify(__dirname + '/../assets/glsl/SkyboxEnvMap.vert')},
        skyboxEnvMapFrag: { glsl: glslify(__dirname + '/../assets/glsl/SkyboxEnvMap.frag')},
    },
    init: function() {
        var ctx = this.getContext();
        this.gui = new GUI(ctx, this.getWidth(), this.getHeight());

        var positions = [[-1, -1], [1,-1], [ 1, 1], [-1,1]];
        var texCoords = [[0, 0], [1, 0], [1, 1], [0, 1]];
        var faces = [[0, 1, 2], [0, 2, 3]];
        this.plane = ctx.createMesh([
            { location: ctx.ATTRIB_POSITION, data: positions },
            { location: ctx.ATTRIB_TEX_COORD_0, data: texCoords}
        ], { data: faces });

        var sphere = createSphere(0.5);
        var sphereAttributes = [
            { data: sphere.positions, location: ctx.ATTRIB_POSITION },
            { data: sphere.uvs, location: ctx.ATTRIB_TEX_COORD_0 },
            { data: sphere.normals, location: ctx.ATTRIB_NORMAL }
        ];
        var sphereIndices = { data: sphere.cells };
        this.sphereMesh = ctx.createMesh(sphereAttributes, sphereIndices);

        var res = this.getResources();
        this.pisaTex = ctx.createTexture2D(res.envMap_pz)
        this.pisaPreviewTex = ctx.createTexture2D(res.pisaPreview)
        this.varTex = ctx.createTexture2D(res.var);
        this.envMap = ctx.createTextureCube([
            { face: 0, data: res.envMap_px },
            { face: 1, data: res.envMap_nx },
            { face: 2, data: res.envMap_py },
            { face: 3, data: res.envMap_ny },
            { face: 4, data: res.envMap_pz },
            { face: 5, data: res.envMap_nz }
        ])

        this.liveEnvMap = ctx.createTextureCube(null, 512, 512, { flipEnvMap: 1 });

        this.texturedProgram = ctx.createProgram(res.texturedVert, res.texturedFrag);
        this.showTexCoordsProgram = ctx.createProgram(res.showTexCoordsVert, res.showTexCoordsFrag);
        this.showColorsProgram = ctx.createProgram(res.showColorsVert, res.showColorsFrag);
        this.skyboxCubemapProgram = ctx.createProgram(res.skyboxCubemapVert, res.skyboxCubemapFrag);
        this.skyboxEnvMapProgram = ctx.createProgram(res.skyboxEnvMapVert, res.skyboxEnvMapFrag);
        this.reflectionCubemap = ctx.createProgram(res.reflectionCubemapVert, res.reflectionCubemapFrag);
        this.reflectionEquirect = ctx.createProgram(res.reflectionEquirectVert, res.reflectionEquirectFrag);

        this.camera = new PerspCamera(45, 1, 0.1, 100);
        this.camera.setPosition([0, 0, -5])
        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.addEventListener(this.arcball);

        this.frontCamera = new PerspCamera(45, 1, 0.1, 100);

        this.debugDraw = new Draw(ctx);

        ctx.setViewMatrix(this.camera.getViewMatrix());
        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.fboTex = ctx.createTexture2D(null, 512, 512);
        this.fboDepthTex = ctx.createTexture2D(null, 512, 512, { magFilter: ctx.NEAREST, minFilter: ctx.NEAREST, format: ctx.DEPTH_COMPONENT, type: ctx.UNSIGNED_SHORT });
        this.fbo = ctx.createFramebuffer([{ texture: this.fboTex }], { texture: this.fboDepthTex });

        var w = this.getWidth();
        var h = this.getHeight();

        this.gui.addTexture2D('Pisa', this.pisaTex);
        this.gui.addTexture2D('Var', this.varTex);
        this.gui.addTexture2D('FBO', this.fboTex);
        this.gui.addTexture2DList('Textures', { textureIndex: 0}, 'textureIndex', [ { texture: this.pisaTex }, { texture: this.varTex }, { texture: this.fboTex }], 3);
        this.gui.addTexture2D('envMap panorama', this.pisaPreviewTex).setPosition(180, 10);
        this.gui.addTextureCube('envMap', this.envMap);
        this.gui.addTextureCube('live envMap', this.liveEnvMap)

        this.gui.addLabel('TexCoords').setPosition(w*1.2/4, 10);
        this.gui.addLabel('Image tex').setPosition(w*2.2/4, 10);
        this.gui.addLabel('Cubemap tex').setPosition(w*2.2/4, 10 + h*1/3);
        this.gui.addLabel('FBO tex').setPosition(w*2.2/4, 10 + h*2/3);
        this.gui.addLabel('Skybox env map').setPosition(w*3.2/4, 10 + h*0/3);
        this.gui.addLabel('Skybox cubemap').setPosition(w*3.2/4, 10 + h*1/3);
        this.gui.addLabel('Skybox cubemap live').setPosition(w*3.2/4, 10 + h*2/3);
    },
    drawScene: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.8,0.8,0.8,1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setLineWidth(5);

        ctx.bindProgram(this.showColorsProgram);

        this.debugDraw.setColor([1,1,1,1]);
        this.debugDraw.drawCube();
        this.debugDraw.drawPivotAxes(1);

        ctx.pushModelMatrix();
        this.debugDraw.setColor([1,0,0,1]);
        ctx.translate([2, 0, 0]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,1,0,1]);
        ctx.translate([0, 2, 0]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,0,1,1]);
        ctx.translate([0, 0, 2]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();
    },
    drawSceneWithSkybox: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.8,0.8,0.8,1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.bindTexture(this.varTex);
        ctx.setLineWidth(5);

        ctx.bindProgram(this.skyboxCubemapProgram);
        this.skyboxCubemapProgram.setUniform('uReflectionMap', 0);
        this.skyboxCubemapProgram.setUniform('uReflectionMapFlipEnvMap', -1);
        ctx.bindTexture(this.envMap, 0);
        ctx.pushModelMatrix();
        this.debugDraw.setColor([1,1,1,1]);
        this.debugDraw.drawCube(100);

        ctx.bindProgram(this.showColorsProgram);
        this.debugDraw.drawPivotAxes(1);
        ctx.popModelMatrix();


        ctx.pushModelMatrix();
        this.debugDraw.setColor([0.8,0,0,1]);
        ctx.translate([2, 0, 0]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,0.8,0,1]);
        ctx.translate([0, 2, 0]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,0,0.8,1]);
        ctx.translate([0, 0, 2]);
        this.debugDraw.drawCube(0.75);
        ctx.popModelMatrix();
    },
    draw: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.2,0.2,0.2,1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        this.arcball.apply();
        ctx.setViewMatrix(this.camera.getViewMatrix());

        var w = this.getWidth();
        var h = this.getHeight();

        ctx.bindProgram(this.showTexCoordsProgram);
        ctx.setViewport(w*1/4, h*2/3, w/4, h/3);
        ctx.bindMesh(this.plane);
        ctx.pushViewMatrix();
        ctx.setViewMatrix(this.frontCamera.getViewMatrix())
        ctx.drawMesh();
        ctx.popViewMatrix();

        ctx.bindProgram(this.texturedProgram);
        this.texturedProgram.setUniform('uTexture', 0);

        ctx.setViewport(w*2/4, h*2/3, w/4, h/3);
        ctx.bindTexture(this.varTex);
        ctx.bindMesh(this.plane);
        ctx.pushViewMatrix();
        ctx.setViewMatrix(this.frontCamera.getViewMatrix())
        ctx.drawMesh();
        ctx.popViewMatrix();

        ctx.setViewport(w*2/4, h*1/3, w/4, h/3);
        ctx.bindTexture(this.pisaTex);
        ctx.bindMesh(this.plane);
        ctx.pushViewMatrix();
        ctx.setViewMatrix(this.frontCamera.getViewMatrix())
        ctx.drawMesh();
        ctx.popViewMatrix();

        ctx.bindFramebuffer(this.fbo);
        ctx.setViewport(0, 0, this.fboTex.getWidth(), this.fboTex.getHeight());
        ctx.bindProgram(this.showColorsProgram);
        this.drawScene();
        ctx.bindFramebuffer(null);

        ctx.setViewport(w*2/4, h*0/3, w/4, h/3);
        ctx.bindProgram(this.texturedProgram);
        this.texturedProgram.setUniform('uTexture', 0);
        ctx.bindTexture(this.fboTex);
        ctx.bindMesh(this.plane);
        ctx.pushViewMatrix();
        ctx.setViewMatrix(this.frontCamera.getViewMatrix())
        ctx.drawMesh();
        ctx.popViewMatrix();

        ctx.setViewport(w*3/4, h*2/3, w/4, h/3);
        ctx.bindProgram(this.skyboxEnvMapProgram);
        this.skyboxEnvMapProgram.setUniform('uReflectionEnvMap', 0);
        ctx.bindTexture(this.pisaPreviewTex);
        this.debugDraw.drawCube(100);
        ctx.bindProgram(this.showColorsProgram);
        this.debugDraw.drawPivotAxes();
        ctx.bindProgram(this.reflectionEquirect);
        this.reflectionEquirect.setUniform('uReflectionMap', 0);
        ctx.bindMesh(this.sphereMesh);
        ctx.drawMesh();

        ctx.setViewport(w*3/4, h/3, w/4, h/3);
        ctx.bindProgram(this.skyboxCubemapProgram);
        this.skyboxCubemapProgram.setUniform('uReflectionMap', 0);
        this.skyboxCubemapProgram.setUniform('uReflectionMapFlipEnvMap', -1);
        ctx.bindTexture(this.envMap);
        this.debugDraw.drawCube(100);
        ctx.bindProgram(this.showColorsProgram);
        this.debugDraw.drawPivotAxes();
        ctx.bindProgram(this.reflectionCubemap);
        this.reflectionCubemap.setUniform('uReflectionMap', 0);
        this.reflectionCubemap.setUniform('uReflectionMapFlipEnvMap', -1);
        ctx.bindMesh(this.sphereMesh);
        ctx.drawMesh();

        renderToCubemap(ctx, this.liveEnvMap, this.drawSceneWithSkybox.bind(this), 0);

        ctx.setViewport(w*3/4, 0, w/4, h/3);
        ctx.setScissor(w*3/4, 0, w/4, h/3)
        ctx.setScissorTest(true)
        var renderRealScene = true;
        if (renderRealScene) {
            this.drawSceneWithSkybox()
        }
        else {
            ctx.bindTexture(this.liveEnvMap, 0);
            ctx.bindProgram(this.skyboxCubemapProgram);
            this.skyboxCubemapProgram.setUniform('uReflectionMap', 0);
            this.skyboxCubemapProgram.setUniform('uReflectionMapFlipEnvMap', 1);
            this.debugDraw.drawCube(100);
            ctx.bindProgram(this.showColorsProgram);
            this.debugDraw.drawPivotAxes();
        }

        ctx.bindTexture(this.liveEnvMap, 0);
        ctx.bindProgram(this.reflectionCubemap);
        this.reflectionCubemap.setUniform('uReflectionMap', 0);
        this.reflectionCubemap.setUniform('uReflectionMapFlipEnvMap', 1);
        ctx.bindMesh(this.sphereMesh);
        ctx.drawMesh();
        ctx.setScissorTest(false)

        ctx.setViewport(0, 0, this.getWidth(), this.getHeight());
        this.gui.draw();
    }
})
