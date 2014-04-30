var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Vec3 = geom.Vec3;
var Loft = gen.Loft;
var Spline3D = geom.Spline3D;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var spline = new Spline3D([
      new Vec3(-2, -1, -1),
      new Vec3(-1,  1, 0),
      new Vec3( 1,  1, 0),
      new Vec3( 2, -1, 1)
    ], false);
    var loft = new Loft(spline, { caps: true, numSteps: 200 });
    this.mesh = new Mesh(loft, new ShowNormals());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 4);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Red);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});