var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');

var LineBuilder = gen.LineBuilder;
var Mesh = glu.Mesh;
var ShowColors = materials.ShowColors;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Vec3 = geom.Vec3;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var lineBuilder = new LineBuilder();

    lineBuilder.addLine(new Vec3(-1, 0.1, 0), new Vec3(1, 0.1, 0), Color.Green, Color.Blue);
    lineBuilder.addCross(new Vec3(0, 0, 0), 1.2, Color.Red);

    this.mesh = new Mesh(lineBuilder, new ShowColors(), { lines: true });

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.White);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});