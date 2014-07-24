var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
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
    var sphereRadius = 0.5;
    var sphereGeometry = new Sphere(sphereRadius);
    var sphereMaterial = new Diffuse({ diffuseColor: Color.Red });

    this.mesh1 = new Mesh(sphereGeometry, sphereMaterial);
    this.mesh2 = new Mesh(sphereGeometry, sphereMaterial);
    this.mesh3 = new Mesh(sphereGeometry, sphereMaterial);

    this.mesh1.position = new Vec3(-1, -0.5, 0);
    this.mesh2.position = new Vec3( 1, -0.5, 0);
    this.mesh3.position = new Vec3( 0, 0.5, 0);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);
    this.mesh1.draw(this.camera);
    this.mesh2.draw(this.camera);
    this.mesh3.draw(this.camera);
  }
});