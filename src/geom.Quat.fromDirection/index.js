var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Time = sys.Time;
var Quat = geom.Quat;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var cube = new Cube(0.2, 0.2, 1);
    this.pointerMesh = new Mesh(cube, new Diffuse( { ambientColor: Color.DarkGrey }));

    var sphere = new Sphere(0.2);
    this.targetMesh = new Mesh(sphere, new Diffuse( { ambientColor: new Color(0.5, 0, 0, 1), diffuseColor: Color.Red }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.targetMesh.position.set(
      1 * Math.cos(Time.seconds),
      1 * Math.sin(Time.seconds),
      1 * Math.cos(Time.seconds) * Math.sin(Time.seconds)
    );
    this.pointerMesh.rotation = Quat.fromDirection(this.targetMesh.position);
    this.pointerMesh.draw(this.camera);
    this.targetMesh.draw(this.camera);
  }
});