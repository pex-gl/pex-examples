var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var geom = require('pex-geom');
var gen = require('pex-geom-gen');
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
    var cube = new Box();
    cube.computeEdges();
    var cubeSub = cube.catmullClark().catmullClark().catmullClark().catmullClark();

    this.scene = [];

    this.scene.push(new Mesh(cubeSub, new SolidColor({ color: Color.Grey }), { lines: false }));
    this.scene.push(new FaceHelper(cubeSub));
    this.scene.push(new VertexHelper(cubeSub));
    this.scene.push(new EdgeHelper(cubeSub));
    //this.scene.push(new VertexNormalHelper(cube));
    //this.scene.push(new FaceNormalHelper(cube));

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