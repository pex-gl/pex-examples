var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var mat = require('pex-materials');
var color = require('pex-color');
var rnd = require('pex-random');

var HexSphere = gen.HexSphere;
var Mesh = glu.Mesh;
var Diffuse = mat.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Time = sys.Time;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var sphere = new HexSphere(0.5, 4);
    sphere = sphere.triangulate();
    sphere.computeNormals();
    this.origSphere = sphere.clone();
    this.mesh = new Mesh(sphere, new Diffuse({ wrap: 1 }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.White);
    glu.enableDepthReadAndWrite(true);

    var origSphere = this.origSphere;

    this.mesh.geometry.vertices.forEach(function(v, vi) {
      var n = origSphere.vertices[vi].dup().normalize()
      var f = 0.1 * rnd.noise3(n.x + Time.seconds, n.y, n.z);
      v.setVec3(origSphere.vertices[vi]);
      v.add(n.scale(f));
    });
    this.mesh.geometry.vertices.dirty = true;
    this.mesh.geometry.computeNormals();

    this.mesh.draw(this.camera);
  }
});
