var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var TexturedEnvMap = materials.TexturedEnvMap;
var SkyBoxEnvMap = materials.SkyBoxEnvMap;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Texture2D = glu.Texture2D;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var envMap = Texture2D.load('../../assets/textures/envmap_blur.jpg');

    this.sphereMesh = new Mesh(new Sphere(), new TexturedEnvMap({ texture: envMap }));
    this.cubeMesh = new Mesh(new Cube(5), new SkyBoxEnvMap({ texture: envMap }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.cubeMesh.draw(this.camera);
    this.sphereMesh.draw(this.camera);
  }
});