var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var geom = require('pex-geom');
var gen = require('pex-gen');
var helpers = require('pex-helpers');

var Sphere = gen.Sphere;
var Box = gen.Box;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var EdgeHelper = helpers.EdgeHelper;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var cube = new Box(0.5).extrude(0.5).catmullClark();

    var points = cube.generateVolumePoints(500);

    this.pointInstances = points.map(function(p) {
      return {
        position: p
      }
    });

    this.pointMesh = new Mesh(new Sphere(0.01), new SolidColor({ color: Color.Red }));
    this.edgeHelper = new EdgeHelper(cube);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    this.edgeHelper.draw(this.camera);
    this.pointMesh.drawInstances(this.camera, this.pointInstances);
  }
});