var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var helpers = require('pex-helpers');
var gui = require('pex-gui');
var random = require('pex-random');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var PerspectiveCameraHelper = helpers.PerspectiveCameraHelper;
var Vec3 = geom.Vec3;
var GUI = gui.GUI;
var Frustum = geom.Frustum;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  near: 0.1,
  far: 6,
  fov: 45,
  targetRotation: 0,
  cameraDistance: 0,
  init: function() {
    this.gui = new GUI(this);
    this.gui.addParam('Near', this, 'near', { min: 0.01, max: 5 });
    this.gui.addParam('Far', this, 'far', { min: 0.2, max: 20 });
    this.gui.addParam('Fov', this, 'fov', { min: 10, max: 120 });
    this.gui.addParam('Camera rotation', this, 'targetRotation', { min: -180, max: 180 });
    this.gui.addParam('Camera distance', this, 'cameraDistance', { min: 0, max: 5 });

    this.mesh = new Mesh(new Cube(0.3), new Diffuse({ wrap: 1}));
    this.meshInstances = [];
    for(var i=0; i<100; i++) {
      this.meshInstances.push({
        position: new Vec3(random.float(-5,5), random.float(-5,5), random.float(-5,5)),
        uniforms: {
          diffuseColor: Color.Red
        }
      })
    }

    this.camera = new PerspectiveCamera(this.fov, this.width / this.height, this.near, this.far);
    this.camera.setPosition(new Vec3(0, 0, 0))
    this.cameraHelper = new PerspectiveCameraHelper(this.camera);
    this.cameraPosition = new Mesh(new Cube(0.2), new SolidColor({ color: Color.Yellow }), { lines: true });
    this.cameraPosition.position = this.camera.position;
    this.cameraTarget = new Mesh(new Cube(0.2), new SolidColor({ color: Color.Yellow }), { lines: true });
    this.cameraTarget.position = this.camera.target;

    this.birdsEyeCamera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.birdsEyeCamera, 10);
    this.arcball.setPosition(new Vec3(-8, 2, 8))
  },
  update: function() {
    this.camera.near = this.near;
    this.camera.far = this.far;
    this.camera.fov = this.fov;
    //rotate camera '90 so it looks towards -Z
    this.camera.position.z = this.cameraDistance;
    this.camera.target.x = 5 * Math.cos((this.targetRotation - 90) / 180 * Math.PI);
    this.camera.target.y = 0;
    this.camera.target.z = this.cameraDistance + 5 * Math.sin((this.targetRotation - 90) / 180 * Math.PI);
    this.camera.updateMatrices();

    var frustum = this.camera.getFrustum();
    this.meshInstances.forEach(function(meshInstance) {
      if (frustum.containsPoint(meshInstance.position)) {
        meshInstance.uniforms.diffuseColor = Color.Green;
      }
      else {
        meshInstance.uniforms.diffuseColor = Color.Red;
      }
    })
  },
  draw: function() {
    this.update();
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.drawInstances(this.birdsEyeCamera, this.meshInstances);

    this.cameraHelper.draw(this.birdsEyeCamera);
    glu.enableDepthReadAndWrite(false);
    this.cameraPosition.draw(this.birdsEyeCamera);
    this.cameraTarget.draw(this.birdsEyeCamera);

    this.gui.draw();
  }
});
