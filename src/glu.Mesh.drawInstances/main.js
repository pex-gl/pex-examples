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
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var sphereGeometry = new Sphere();
    var sphereMaterial = new Diffuse({ diffuseColor: Color.Red });
    var numInstances = 200;
    this.instances = [];

    for(var i=0; i<numInstances; i++) {
      var radius = geom.randomFloat(0.1, 0.5);
      var hue = geom.randomFloat();
      var instance = {
        position: geom.randomVec3(2), //mesh position
        scale: new Vec3(radius, radius, radius), //mesh scale
        uniforms: { //material uniforms
          diffuseColor: Color.fromHSL(hue, 1, 0.5)
        }
      };
      this.instances.push(instance);
    }

    this.mesh = new Mesh(sphereGeometry, sphereMaterial);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 3);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);
    this.mesh.drawInstances(this.camera, this.instances);
  }
});
