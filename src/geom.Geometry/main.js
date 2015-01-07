var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
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
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var triangleVertices = [
      new Vec3(-1, -0.5, 0),
      new Vec3( 1, -0.5, 0),
      new Vec3( 0, 0.5, 0)
    ];

    var triangleFaces = [
      [ 0, 1, 2 ]
    ];

    var triangleColors = [
      Color.Red,
      Color.Green,
      Color.Blue
    ];

    var triangleGeometry = new Geometry({ vertices: triangleVertices, faces: triangleFaces, colors: triangleColors });

    var triangleMaterial = new ShowColors();

    this.mesh = new Mesh(triangleGeometry, triangleMaterial);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});
