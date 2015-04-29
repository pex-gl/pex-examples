var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var helpers = require('pex-helpers');
var gui = require('pex-gui');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var PerspectiveCameraHelper = helpers.PerspectiveCameraHelper;
var Vec3 = geom.Vec3;
var GUI = gui.GUI;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  near: 0.1,
  far: 6,
  fov: 45,
  init: function() {
    this.gui = new GUI(this);
    this.gui.addParam('Near', this, 'near', { min: 0.01, max: 5 });
    this.gui.addParam('Far', this, 'far', { min: 0.2, max: 20 });
    this.gui.addParam('Fov', this, 'fov', { min: 10, max: 120 });

    this.mesh = new Mesh(new Cube(), new ShowNormals());

    this.camera = new PerspectiveCamera(this.fov, this.width / this.height, this.near, this.far);
    this.camera.setPosition(new Vec3(0, 0, 5))
    this.cameraHelper = new PerspectiveCameraHelper(this.camera);
    this.cameraPosition = new Mesh(new Cube(0.2), new SolidColor({ color: Color.Yellow }), { lines: true });
    this.cameraPosition.position = this.camera.position;
    this.cameraTarget = new Mesh(new Cube(0.2), new SolidColor({ color: Color.Yellow }), { lines: true });
    this.cameraTarget.position = this.camera.target;

    this.birdsEyeCamera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.birdsEyeCamera, 10);
    this.arcball.setPosition(new Vec3(-8, 2, 8))
  },
  draw: function() {
    this.camera.setNear(this.near);
    this.camera.setFar(this.far);
    this.camera.setFov(this.fov);

    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.birdsEyeCamera);

    this.cameraHelper.draw(this.birdsEyeCamera);
    glu.enableDepthReadAndWrite(false);
    this.cameraPosition.draw(this.birdsEyeCamera);
    this.cameraTarget.draw(this.birdsEyeCamera);

    this.gui.draw();
  }
});
