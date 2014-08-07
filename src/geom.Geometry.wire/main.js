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
    type: '3d'
  },
  init: function() {
    var cube = new Box(0.5);
    var cubeSub = cube.wire(0.1);
    var cubeSubSub = cube.wire(0.1).wire(0.01).triangulate();

    this.scene = [];

    var mesh = new Mesh(cube, new SolidColor({ color: Color.Grey }), { lines: false });
    var vertexHelper = new VertexHelper(cube);
    var edgeHelper = new EdgeHelper(cube);
    mesh.position.x = vertexHelper.position.x = edgeHelper.position.x = -1;

    var meshSub = new Mesh(cubeSub, new SolidColor({ color: Color.Grey }), { lines: false });
    var vertexHelperSub = new VertexHelper(cubeSub);
    var edgeHelperSub = new EdgeHelper(cubeSub);
    meshSub.position.x = vertexHelperSub.position.x = edgeHelperSub.position.x = 0;

    var meshSubSub = new Mesh(cubeSubSub, new SolidColor({ color: Color.Grey }), { lines: false });
    var vertexHelperSubSub = new VertexHelper(cubeSubSub);
    var edgeHelperSubSub = new EdgeHelper(cubeSubSub);
    meshSubSub.position.x = vertexHelperSubSub.position.x = edgeHelperSubSub.position.x = 1;

    this.scene = [
      mesh, vertexHelper, edgeHelper,
      meshSub, vertexHelperSub, edgeHelperSub,
      meshSubSub, vertexHelperSubSub, edgeHelperSubSub
    ];

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    this.scene.forEach(function(o) {
      o.draw(this.camera);
    }.bind(this));
  }
});