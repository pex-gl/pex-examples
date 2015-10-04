var Window = require('pex-sys/Window');
var Mat4 = require('pex-math/Mat4');
var Vec3 = require('pex-math/Vec3');
var isBrowser = require('is-browser');
var PerspCamera = require('pex-cam/PerspCamera');
var Arcball = require('pex-cam/Arcball');
var glslify = require('glslify-promise');
var Draw = require('pex-draw');
var GUI = require('pex-gui');

var ASSETS_DIR = isBrowser ? '../assets' :  __dirname + '/../assets';


if (isBrowser) {
    FRAG = 'precision highp float;' + '\n' + FRAG;
}

//Flipping up by -1 inspired by http://www.mbroecker.com/project_dynamic_cubemaps.html
var sides = [
    { eye: [0, 0, 0], target: [ 1, 0, 0], up: [0, -1, 0], color: [1, 0, 0, 1] },
    { eye: [0, 0, 0], target: [-1, 0, 0], up: [0, -1, 0], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0,  1, 0], up: [0, 0, 1], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, -1, 0], up: [0, 0, -1], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, 0,  1], up: [0, -1, 0], color: [0, 0, 0, 1] },
    { eye: [0, 0, 0], target: [0, 0, -1], up: [0, -1, 0], color: [0, 0, 0, 1] },
];

var fbo = null;
var projectionMatrix = null;
var viewMatrix = null;

function renderToCubemap(ctx, cubemap, drawScene, level) {
    level = level || 0;
    if (!fbo) {
        fbo = ctx.createFramebuffer();
        projectionMatrix = Mat4.perspective(Mat4.create(), 90, 1, 0.001, 50.0);
        viewMatrix = Mat4.create();
    }

    ctx.pushState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.COLOR_BIT);
    ctx.setViewport(0, 0, cubemap.getWidth(), cubemap.getHeight());
    ctx.bindFramebuffer(fbo);
    ctx.setProjectionMatrix(projectionMatrix);
    sides.forEach(function(side, sideIndex) {
        fbo.setColorAttachment(0, ctx.TEXTURE_CUBE_MAP_POSITIVE_X + sideIndex, cubemap.getHandle(), level);
        ctx.setClearColor(side.color[0], side.color[1], side.color[2], 1);
        //ctx.setClearColor(0, 0, 0, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        Mat4.lookAt(viewMatrix, side.eye, side.target, side.up);
        ctx.setViewMatrix(viewMatrix);
        drawScene();
    })
    ctx.popState(ctx.VIEWPORT_BIT | ctx.FRAMEBUFFER_BIT | ctx.MATRIX_PROJECTION_BIT | ctx.MATRIX_VIEW_BIT | ctx.COLOR_BIT);
}

Window.create({
    settings: {
        width: 1200,
        height: 900
    },
    resources: {
        texturedVert: { glsl: glslify(ASSETS_DIR + '/glsl/Textured.vert')},
        texturedFrag: { glsl: glslify(ASSETS_DIR + '/glsl/Textured.frag')},
        showTexCoordsVert: { glsl: glslify(ASSETS_DIR + '/glsl/ShowTexCoords.vert')},
        showTexCoordsFrag: { glsl: glslify(ASSETS_DIR + '/glsl/ShowTexCoords.frag')},
        showColorsVert: { glsl: glslify(ASSETS_DIR + '/glsl/ShowColors.vert')},
        showColorsFrag: { glsl: glslify(ASSETS_DIR + '/glsl/ShowColors.frag')},
        envMap_px: { image: ASSETS_DIR + '/cubemaps/pisa_posx.jpg' },
        envMap_nx: { image: ASSETS_DIR + '/cubemaps/pisa_negx.jpg' },
        envMap_py: { image: ASSETS_DIR + '/cubemaps/pisa_posy.jpg' },
        envMap_ny: { image: ASSETS_DIR + '/cubemaps/pisa_negy.jpg' },
        envMap_pz: { image: ASSETS_DIR + '/cubemaps/pisa_posz.jpg' },
        envMap_nz: { image: ASSETS_DIR + '/cubemaps/pisa_negz.jpg' },
        pisaPreview: { image: ASSETS_DIR + '/cubemaps/pisa_preview.jpg' },
        var: { image: ASSETS_DIR + '/textures/var.png' },
        skyboxVert: { glsl: glslify(ASSETS_DIR + '/glsl/Skybox.vert')},
        skyboxFrag: { glsl: glslify(ASSETS_DIR + '/glsl/Skybox.frag')},
        skyboxEnvMapVert: { glsl: glslify(ASSETS_DIR + '/glsl/SkyboxEnvMap.vert')},
        skyboxEnvMapFrag: { glsl: glslify(ASSETS_DIR + '/glsl/SkyboxEnvMap.frag')},
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

        var res = this.getResources();
        this.pisaTex = ctx.createTexture2D(res.envMap_pz, res.envMap_pz.width, res.envMap_pz.height, { flip: true })
        this.pisaPreviewTex = ctx.createTexture2D(res.pisaPreview, res.pisaPreview.width, res.pisaPreview.height, { flip: true })
        this.varTex = ctx.createTexture2D(res.var, res.var.width, res.var.height, { flip: true });
        this.envMap = ctx.createTextureCube([
            { face: 0, data: res.envMap_px },
            { face: 1, data: res.envMap_nx },
            { face: 2, data: res.envMap_py },
            { face: 3, data: res.envMap_ny },
            { face: 4, data: res.envMap_pz },
            { face: 5, data: res.envMap_nz }
        ])

        this.liveEnvMap = ctx.createTextureCube(null, 512, 512);

        this.texturedProgram = ctx.createProgram(res.texturedVert, res.texturedFrag);
        this.showTexCoordsProgram = ctx.createProgram(res.showTexCoordsVert, res.showTexCoordsFrag);
        this.showColorsProgram = ctx.createProgram(res.showColorsVert, res.showColorsFrag);
        this.skyboxProgram = ctx.createProgram(res.skyboxVert, res.skyboxFrag);
        this.skyboxEnvMapProgram = ctx.createProgram(res.skyboxEnvMapVert, res.skyboxEnvMapFrag);

        this.camera = new PerspCamera(45, 1, 0.1, 100);
        this.arcball = new Arcball(this.camera, this.getWidth(), this.getHeight());
        this.addEventListener(this.arcball);

        this.debugDraw = new Draw(ctx);

        ctx.setViewMatrix(this.camera.getViewMatrix());
        ctx.setProjectionMatrix(this.camera.getProjectionMatrix());

        this.fboTex = ctx.createTexture2D(null, 512, 512);
        this.fbo = ctx.createFramebuffer([{ texture: this.fboTex }]);

        var w = this.getWidth();
        var h = this.getHeight();

        this.gui.addTexture2D('Pisa', this.pisaTex);
        this.gui.addTexture2D('Var', this.varTex);
        this.gui.addTexture2D('FBO', this.fboTex);
        this.gui.addTexture2DList('Textures', { textureIndex: 0}, 'textureIndex', [ { texture: this.pisaTex }, { texture: this.varTex }, { texture: this.fboTex }], 3);
        this.gui.addTexture2D('envMap panorama', this.pisaPreviewTex).setPosition(180, 10);
        this.gui.addTextureCube('envMap', this.envMap, { flipZ: -1});
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
        this.debugDraw.drawCube();
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,1,0,1]);
        ctx.translate([0, 2, 0]);
        this.debugDraw.drawCube();
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,0,1,1]);
        ctx.translate([0, 0, 2]);
        this.debugDraw.drawCube();
        ctx.popModelMatrix();
    },
    drawSceneWithSkybox: function() {
        var ctx = this.getContext();
        ctx.setClearColor(0.8,0.8,0.8,1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.bindTexture(this.varTex);
        ctx.setLineWidth(5);

        ctx.bindProgram(this.skyboxProgram);
        ctx.bindTexture(this.envMap, 0);
        ctx.pushModelMatrix();
        this.debugDraw.setColor([1,1,1,1]);
        this.debugDraw.drawCube(10);
        this.debugDraw.drawPivotAxes(1);
        ctx.popModelMatrix();

        ctx.bindProgram(this.showColorsProgram);

        ctx.pushModelMatrix();
        this.debugDraw.setColor([1,0,0,1]);
        ctx.translate([2, 0, 0]);
        this.debugDraw.drawCube();
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,1,0,1]);
        ctx.translate([0, 2, 0]);
        this.debugDraw.drawCube(1);
        ctx.popModelMatrix();

        ctx.pushModelMatrix();
        this.debugDraw.setColor([0,0,1,1]);
        ctx.translate([0, 0, 2]);
        this.debugDraw.drawCube();
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
        ctx.drawMesh();

        ctx.bindProgram(this.texturedProgram);
        this.texturedProgram.setUniform('uTexture', 0);

        ctx.setViewport(w*2/4, h*2/3, w/4, h/3);
        ctx.bindTexture(this.varTex);
        ctx.bindMesh(this.plane);
        ctx.drawMesh();

        ctx.setViewport(w*2/4, h*1/3, w/4, h/3);
        ctx.bindTexture(this.pisaTex);
        ctx.bindMesh(this.plane);
        ctx.drawMesh();

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
        ctx.drawMesh();

        ctx.setViewport(w*3/4, h*2/3, w/4, h/3);
        ctx.bindProgram(this.skyboxEnvMapProgram);
        this.skyboxEnvMapProgram.setUniform('uReflectionEnvMap', 0);
        this.skyboxEnvMapProgram.setUniform('uFlipZ', -1.0);
        ctx.bindTexture(this.pisaPreviewTex);
        this.debugDraw.drawCube(20);

        ctx.setViewport(w*3/4, h/3, w/4, h/3);
        ctx.bindProgram(this.skyboxProgram);
        this.skyboxProgram.setUniform('uReflectionMap', 0);
        this.skyboxProgram.setUniform('uFlipZ', -1.0);
        ctx.bindTexture(this.envMap);
        this.debugDraw.drawCube(20);

        renderToCubemap(ctx, this.liveEnvMap, this.drawSceneWithSkybox.bind(this), 0);

        ctx.setViewport(w*3/4, 0, w/4, h/3);
        ctx.bindProgram(this.skyboxProgram);
        this.skyboxProgram.setUniform('uReflectionMap', 0);
        this.skyboxProgram.setUniform('uFlipZ', 1.0);
        ctx.bindTexture(this.liveEnvMap);
        this.debugDraw.drawCube(20);

        //TODO:
        //envmap panorama

        ctx.setViewport(0, 0, this.getWidth(), this.getHeight());
        this.gui.draw();
    }
})
