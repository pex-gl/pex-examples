var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var geom = require('pex-geom');
var gen = require('pex-gen');
var helpers = require('pex-helpers');

var Cube = gen.Cube;
var Box = gen.Box;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var VertexHelper = helpers.VertexHelper;
var EdgeHelper = helpers.EdgeHelper;
var FaceHelper = helpers.FaceHelper;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser,
    highdpi: 2
  },
  init: function() {
    var cube = new Box(0.5, 0.5, 0.5);
    var cube2 = cube.triangulate();

    this.scene = [];

    var mesh = new Mesh(cube, new SolidColor({ color: Color.Grey }), { lines: false });
    var vertexHelper = new VertexHelper(cube);
    var edgeHelper = new EdgeHelper(cube);
    mesh.position.x = vertexHelper.position.x = edgeHelper.position.x = -0.5;

    var mesh2 = new Mesh(cube2, new SolidColor({ color: Color.Grey }), { lines: false });
    var vertexHelper2 = new VertexHelper(cube2);
    var edgeHelper2 = new EdgeHelper(cube2);
    mesh2.position.x = vertexHelper2.position.x = edgeHelper2.position.x = 0.5;

    this.scene = [
      mesh, vertexHelper, edgeHelper,
      mesh2, vertexHelper2, edgeHelper2
    ];

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    glu.lineWidth(2);

    this.scene.forEach(function(o) {
      o.draw(this.camera);
    }.bind(this));
  }
});
