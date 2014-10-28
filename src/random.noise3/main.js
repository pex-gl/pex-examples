var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var mat = require('pex-materials');
var color = require('pex-color');
var rnd = require('pex-random');

var HexSphere = gen.HexSphere;
var Mesh = glu.Mesh;
var ShowNormals = mat.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var sphere = new HexSphere(0.5, 4);
    sphere.vertices.forEach(function(v) {
      var n = v.dup().normalize()
      var f = 0.1 * rnd.noise3(n.x, n.y, n.z);
      v.add(n.scale(f));
    })

    sphere = sphere.triangulate();
    sphere.computeNormals();
    this.mesh = new Mesh(sphere, new ShowNormals());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.White);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
  }
});
