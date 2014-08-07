var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var helpers = require('pex-helpers');

var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var Context = glu.Context;
var ShowNormals = materials.ShowNormals;
var Diffuse = materials.Diffuse;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var AxisHelper = helpers.AxisHelper;
var Vec3 = geom.Vec3;

sys.Window.create({
  settings: {
    width: 1024,
    height: 512,
    type: '3d'
  },
  showDragPos: false,
  init: function() {
    var cube = new Cube(1);
    this.mesh = new Mesh(cube, new ShowNormals());

    this.camera = new PerspectiveCamera(60, 1);
    this.arcball = new Arcball(this, this.camera, 5);
    this.arcball.setPosition(new Vec3(5, 5, 5));

    this.axisHelper = new AxisHelper(2);
    this.debugAxisHelper = new AxisHelper(1);

    this.debugCamera = new PerspectiveCamera(60, 1);
    this.debugCamera.setPosition(new Vec3(0, 1, 3));

    this.cameraMesh = new Mesh(new Cube(0.1, 0.1, 0.2), new Diffuse());

    var sphere = new Sphere(1.5, 16, 16);
    sphere.computeEdges();
    this.debugArcballSphere = new Mesh(sphere, new SolidColor({ color: new Color(0.2, 0.2, 0.2, 0.2)} ), { lines: true });

    this.dragPos = new Mesh(new Sphere(0.1), new SolidColor({ color: Color.Red }));

    var cube = new Cube(0.2, 0.2, 1);
    cube.vertices.forEach(function(v) {
      if (v.z > 0) {
        v.y = 0;
        v.x = 0;
        v.z += 0.5;
      }
      v.z += 0.5;
    })
    this.pointerMesh = new Mesh(cube, new Diffuse( { ambientColor: Color.DarkGrey }));

    this.on('leftMouseDown', function(e) {
      this.showDragPos = true;
    }.bind(this));

    this.on('leftMouseUp', function(e) {
      this.showDragPos = false;
    }.bind(this));
  },
  draw: function() {
    glu.enableDepthReadAndWrite(true);

    var gl = Context.currentContext;
    gl.lineWidth(3);

    glu.viewport(0, 0, this.width/2, this.height);
    glu.clearColorAndDepth(Color.Black);
    this.axisHelper.draw(this.camera);
    this.mesh.scale.set(1.5, 1.5, 1.5);
    this.mesh.draw(this.camera);

    glu.viewport(this.width/2, 0, this.width/2, this.height);
    this.debugAxisHelper.draw(this.debugCamera);
    this.mesh.scale.set(0.5, 0.5, 0.5);
    this.mesh.draw(this.debugCamera);

    this.pointerMesh.material.uniforms.diffuseColor = Color.White;
    this.pointerMesh.rotation.setDirection(this.camera.getPosition());
    this.pointerMesh.draw(this.debugCamera);

    this.cameraMesh.rotation.setDirection(this.camera.getPosition().dup().normalize());
    this.cameraMesh.position.setVec3(this.camera.getPosition().dup().normalize().scale(1.5));
    this.cameraMesh.draw(this.debugCamera);

    gl.lineWidth(1);
    this.debugArcballSphere.draw(this.debugCamera);
    if (this.showDragPos) {
      this.dragPos.position = this.arcball.dragPos.dup().normalize().scale(1.5);
      this.dragPos.draw(this.debugCamera);
    }

    glu.viewport(0, 0, this.width, this.height);
  }
});