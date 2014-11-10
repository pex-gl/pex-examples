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
var Path = geom.Path;
var Spline3D = geom.Spline3D;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var lineBuilder = new LineBuilder();

    var points = [
      new Vec3(-1.5, -1.0, 0),
      new Vec3(-0.5, -0.7, 0),
      new Vec3( 0.5,  0.7, 0),
      new Vec3( 1.5,  1.0, 0)
    ];

    var path = new Path(points.map(function(p) {
      return p.dup().add(new Vec3(0, 0, -0.1))
    }));

    var spline = new Spline3D(points.map(function(p) {
      return p.dup().add(new Vec3(0, 0, 0.1))
    }));

    points.forEach(function(p, pi) {
      lineBuilder.addCross(p, 0.05, Color.Green);
      if (pi > 0) {
        lineBuilder.addLine(p, points[pi-1], Color.Green);
      }
    });

    lineBuilder.addPath(path, Color.Blue, 8, true);
    lineBuilder.addPath(spline, Color.Orange, 16, true);
    lineBuilder.addCross(new Vec3(0, 0, 0), 2, Color.Red);

    this.mesh = new Mesh(lineBuilder, new ShowColors(), { lines: true });

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 3);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.White);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});
