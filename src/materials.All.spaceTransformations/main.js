var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var gui = require('pex-gui');

var Platform = sys.Platform;
var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
var ShowDepth = materials.ShowDepth;
var ShowPosition = materials.ShowPosition;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var RenderTarget = glu.RenderTarget;
var Texture2D = glu.Texture2D;
var ScreenImage = glu.ScreenImage;
var Vec3 = geom.Vec3;
var GUI = gui.GUI;
var Program = glu.Program;

var ShowWorldPosition = require('./materials/ShowWorldPosition');

var ViewSize = 250;
var rtWidth = 512;
var rtHeight = 512;

sys.Window.create({
  settings: {
    width: 1250,
    height: 750,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    this.gui = new GUI(this);

    //find the preview size so they all fit on screen
    ViewSize = Math.pow(2, Math.ceil(Math.log(this.width)/Math.log(2))) >> 3;
    while(ViewSize > 4 && ViewSize * 4 > this.width) {
      ViewSize >>= 1;
    }

    var cube = new Cube(0.5);
    var mesh = new Mesh(cube, new Diffuse( { diffuseColor: Color.Grey, ambientColor: Color.DarkGrey }));
    var meshRight = new Mesh(cube, new Diffuse( { diffuseColor: Color.Red, ambientColor: Color.DarkGrey }));
    meshRight.position = new Vec3(1, 0, 0);
    var meshTop = new Mesh(cube, new Diffuse( { diffuseColor: Color.Green, ambientColor: Color.DarkGrey }));
    meshTop.position = new Vec3(0, 1, 0);
    var meshFront = new Mesh(cube, new Diffuse( { diffuseColor: Color.Blue, ambientColor: Color.DarkGrey }));
    meshFront.position = new Vec3(0, 0, 1);

    var sphere = new Sphere();
    var sphereMesh = new Mesh(sphere, new Diffuse( { diffuseColor: Color.Pink }))
    sphereMesh.position.z = -0.5;
    sphereMesh.scale.set(5, 5, 0.5);

    this.scene = [ mesh, meshRight, meshTop, meshFront, sphereMesh ];

    this.camera = new PerspectiveCamera(60, rtWidth / rtHeight, 1, 10);
    this.arcball = new Arcball(this, this.camera);
    this.arcball.setPosition(new Vec3(0, 0, 4));

    this.drawToScreen = (function() {
      //GUI counts pixels from top left
      this.gui.addLabel('Color').setPosition(5, 5);
      return function() {
        //viewport counts pixels from bottom left
        glu.viewport(0, this.height-ViewSize, ViewSize, ViewSize);
        glu.clearColorAndDepth(Color.Black);
        this.drawScene();
      }.bind(this);
    }.bind(this))();

    this.drawToColorTex = (function() {
      this.gui.addLabel('ColorTex').setPosition(5, 5 + ViewSize);
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: true });
      var screenImage = new ScreenImage(colorTex, 0, ViewSize, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene();
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();

    this.drawToDepthTex = (function() {
      this.gui.addLabel('DepthTex').setPosition(5 + ViewSize, 5);
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(depthBuf, ViewSize, 0, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene();
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();

    this.drawToShowDepth = (function() {
      this.gui.addLabel('ShowDepth').setPosition(5 + ViewSize, 5 + ViewSize);
      var showDepth = new ShowDepth();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: true });
      var screenImage = new ScreenImage(colorTex, ViewSize, ViewSize, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.White);
        showDepth.uniforms.near = this.camera.getNear();
        showDepth.uniforms.far = this.camera.getFar();
        this.drawScene(showDepth);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();

    this.drawToDepthCompare = (function() {
      this.gui.addLabel('DepthCompare').setPosition(5 + 1 * ViewSize, 5 + 2 * ViewSize);
      var showDepth = new ShowDepth();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(colorTex, 1 * ViewSize, 2 * ViewSize, ViewSize, ViewSize, this.width, this.height);
      var depthCompare = Program.load('./shaders/DepthCompare.glsl');
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.White);
        showDepth.uniforms.near = this.camera.getNear();
        showDepth.uniforms.far = this.camera.getFar();
        this.drawScene(showDepth);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        depthBuf.bind(0);
        colorTex.bind(1);
        depthCompare.use();
        depthCompare.uniforms.depthBuf(0);
        depthCompare.uniforms.depthTex(1);
        screenImage.draw(null, depthCompare);
      }.bind(this);
    }.bind(this))();

    this.drawToShowPosition = (function() {
      this.gui.addLabel('ShowPosition').setPosition(5 + 2 * ViewSize, 5);
      var showPosition = new ShowPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: true });
      var screenImage = new ScreenImage(colorTex, 2 * ViewSize, 0, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();

    this.drawToReconstructPosition = (function() {
      this.gui.addLabel('ReconstructPosition').setPosition(5 + 2 * ViewSize, 5 + ViewSize);
      var showPosition = new ShowPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(colorTex, 2 * ViewSize, ViewSize, ViewSize, ViewSize, this.width, this.height);
      var resonstructPosition = Program.load('./shaders/ReconstructPosition.glsl');
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        depthBuf.bind(0);
        resonstructPosition.use();
        resonstructPosition.uniforms.depthBuf(0);
        resonstructPosition.uniforms.near(this.camera.getNear());
        resonstructPosition.uniforms.far(this.camera.getFar());
        resonstructPosition.uniforms.fov(this.camera.getFov());
        resonstructPosition.uniforms.aspectRatio(this.camera.getAspectRatio());
        screenImage.draw(null, resonstructPosition);
      }.bind(this);
    }.bind(this))();

    this.drawToReconstructPositionCompare = (function() {
      this.gui.addLabel('ReconstructPositionCompare').setPosition(5 + 2 * ViewSize, 5 + 2 * ViewSize);
      var showPosition = new ShowPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(colorTex, 2 * ViewSize, 2 * ViewSize, ViewSize, ViewSize, this.width, this.height);
      var resonstructPosition = Program.load('./shaders/ReconstructPositionCompare.glsl');
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        depthBuf.bind(0);
        colorTex.bind(1);
        resonstructPosition.use();
        resonstructPosition.uniforms.depthBuf(0);
        resonstructPosition.uniforms.positionBuf(1);
        resonstructPosition.uniforms.near(this.camera.getNear());
        resonstructPosition.uniforms.far(this.camera.getFar());
        resonstructPosition.uniforms.fov(this.camera.getFov());
        resonstructPosition.uniforms.aspectRatio(this.camera.getAspectRatio());
        screenImage.draw(null, resonstructPosition);
      }.bind(this);
    }.bind(this))();

    this.drawToShowWorldPosition = (function() {
      this.gui.addLabel('ShowWorldPosition').setPosition(5 + 3 * ViewSize, 5);
      var showWorldPosition = new ShowWorldPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: true });
      var screenImage = new ScreenImage(colorTex, 3 * ViewSize, 0, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showWorldPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();

    this.drawToReconstructWorldPosition = (function() {
      this.gui.addLabel('ReconstructWorldPosition').setPosition(5 + 3 * ViewSize, 5 + 1 * ViewSize);
      var showPosition = new ShowWorldPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(colorTex, 3 * ViewSize, ViewSize, ViewSize, ViewSize, this.width, this.height);
      var resonstructPosition = Program.load('./shaders/ReconstructWorldPosition.glsl');
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        depthBuf.bind(0);
        resonstructPosition.use();
        resonstructPosition.uniforms.depthBuf(0);
        resonstructPosition.uniforms.near(this.camera.getNear());
        resonstructPosition.uniforms.far(this.camera.getFar());
        resonstructPosition.uniforms.fov(this.camera.getFov());
        resonstructPosition.uniforms.aspectRatio(this.camera.getAspectRatio());
        resonstructPosition.uniforms.invViewMatrix(this.camera.getViewMatrix().dup().invert());
        screenImage.draw(null, resonstructPosition);
      }.bind(this);
    }.bind(this))();

    this.drawToReconstructWorldPositionCompare = (function() {
      this.gui.addLabel('ReconstructWorldPositionCompare').setPosition(5 + 3 * ViewSize, 5 + 2 * ViewSize);
      var showPosition = new ShowWorldPosition();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { bpp: 32 });
      var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: depthBuf });
      var screenImage = new ScreenImage(colorTex, 3 * ViewSize, 2 * ViewSize, ViewSize, ViewSize, this.width, this.height);
      var resonstructPosition = Program.load('./shaders/ReconstructWorldPositionCompare.glsl');
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showPosition);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        depthBuf.bind(0);
        colorTex.bind(1);
        resonstructPosition.use();
        resonstructPosition.uniforms.depthBuf(0);
        resonstructPosition.uniforms.positionBuf(1);
        resonstructPosition.uniforms.near(this.camera.getNear());
        resonstructPosition.uniforms.far(this.camera.getFar());
        resonstructPosition.uniforms.fov(this.camera.getFov());
        resonstructPosition.uniforms.aspectRatio(this.camera.getAspectRatio());
        resonstructPosition.uniforms.invViewMatrix(this.camera.getViewMatrix().dup().invert());
        screenImage.draw(null, resonstructPosition);
      }.bind(this);
    }.bind(this))();

    this.drawToShowNormals = (function() {
      this.gui.addLabel('ShowNormals').setPosition(5 + 4 * ViewSize, 5);
      var showNormals = new ShowNormals();
      var colorTex = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
      var renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorTex, depth: true });
      var screenImage = new ScreenImage(colorTex, 4 * ViewSize, 0, ViewSize, ViewSize, this.width, this.height);
      return function() {
        glu.viewport(0, 0, renderTarget.width, renderTarget.height);
        renderTarget.bind();
        glu.clearColorAndDepth(Color.Black);
        this.drawScene(showNormals);
        renderTarget.unbind();
        glu.viewport(0, 0, this.width, this.height);
        screenImage.draw();
      }.bind(this);
    }.bind(this))();
  },
  drawScene: function(material) {
    glu.enableDepthReadAndWrite(true, true);
    this.scene.forEach(function(mesh) {
      if (material) {
        var oldMaterial = mesh.getMaterial();
        mesh.setMaterial(material);
        mesh.draw(this.camera);
        mesh.setMaterial(oldMaterial);
      }
      else {
        mesh.draw(this.camera);
      }
    }.bind(this));
  },

  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);


    this.drawToScreen();
    this.drawToColorTex();
    this.drawToDepthTex();
    this.drawToShowDepth();
    this.drawToDepthCompare();
    this.drawToShowPosition();
    this.drawToReconstructPosition();
    this.drawToReconstructPositionCompare();
    this.drawToShowWorldPosition();
    this.drawToReconstructWorldPosition();
    this.drawToReconstructWorldPositionCompare();
    this.drawToShowNormals();

    glu.viewport(0, 0, this.width, this.height);
    this.gui.draw();
  }
});
