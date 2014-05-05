var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var helpers = require('pex-helpers');

var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var VertexHelper = helpers.VertexHelper;
var EdgeHelper = helpers.EdgeHelper;
var FaceHelper = helpers.FaceHelper;
var VertexNormalHelper = helpers.VertexNormalHelper;
var FaceNormalHelper = helpers.FaceNormalHelper;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var sphere = new Sphere(0.5, 8, 8);
    this.mesh = new Mesh(sphere, new SolidColor({ color: Color.Grey }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.helperMeshes = [];
    this.helperMeshes.push(new VertexHelper(sphere));
    this.helperMeshes.push(new EdgeHelper(sphere));
    this.helperMeshes.push(new FaceHelper(sphere));
    this.helperMeshes.push(new VertexNormalHelper(sphere));
    this.helperMeshes.push(new FaceNormalHelper(sphere));
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);

    this.helperMeshes.forEach(function(helper) {
      helper.draw(this.camera);
    }.bind(this));
  }
});