var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var helpers = require('pex-helpers');

var Cube = gen.Cube;
var LineBuilder = gen.LineBuilder;
var Mesh = glu.Mesh;
var Context = glu.Context;
var ShowNormals = materials.ShowNormals;
var ShowColors = materials.ShowColors;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var AxisHelper = helpers.AxisHelper;
var Vec3 = geom.Vec3;
var Plane = geom.Plane;
var Ray = geom.Ray;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  showDragPos: false,
  init: function() {
    var cube = new Cube(1);
    cube.computeEdges();
    this.mesh = new Mesh(cube, new ShowNormals(), { lines: true });

    this.camera = new PerspectiveCamera(60, this.width/this.height);
    this.arcball = new Arcball(this, this.camera);
    this.arcball.setPosition(new Vec3(3, 3, 3));

    this.plane = new Plane(new Vec3(0, 0, 0), new Vec3(0, 0, 1));
    this.planeLines = new LineBuilder();
    this.planeMesh = new Mesh(this.planeLines, new ShowColors(), { lines: true });

    this.axisHelper = new AxisHelper(2);

    this.updatePlane();

    this.on('leftMouseDown', function(e) {
      this.showDragPos = true;
      this.updatePlane();
    }.bind(this));

    this.on('mouseDragged', function(e) {
      this.updatePlane();
    }.bind(this));

    this.on('scrollWheel', function(e) {
      this.updatePlane();
    }.bind(this));

    this.on('leftMouseUp', function(e) {
      this.showDragPos = false;
      this.updatePlane();
    }.bind(this));
  },
  updatePlane: function() {
    var viewMatrix = this.camera.getViewMatrix();
    var invViewMatrix = viewMatrix.dup().invert();
    var target = this.camera.getTarget().dup().add(new Vec3(0.01, 0.01, 0.01));
    var targetInCameraSpace = target.dup().transformMat4(viewMatrix);
    this.plane = this.arcball.panPlane

    this.planeLines.reset();

    if (this.plane) {
      var points = [
        new Vec3(-1, -1, 0).add(targetInCameraSpace),
        new Vec3( 1, -1, 0).add(targetInCameraSpace),
        new Vec3( 1,  1, 0).add(targetInCameraSpace),
        new Vec3(-1,  1, 0).add(targetInCameraSpace)
      ];
      var pointsInWorldSpace = points.map(function(p) {
        return p.dup().transformMat4(invViewMatrix);
      }.bind(this));
      pointsInWorldSpace.forEach(function(p, pi) {
        this.planeLines.addCross(p);
        this.planeLines.addLine(p, pointsInWorldSpace[(pi + 1) % pointsInWorldSpace.length]);
      }.bind(this));

      var from = this.arcball.clickPosViewSpace.dup().transformMat4(invViewMatrix);
      var to = this.arcball.dragPosViewSpace.dup().transformMat4(invViewMatrix);
      var fromPlane = this.arcball.clickPosPlane.dup().transformMat4(invViewMatrix);
      var toPlane = this.arcball.dragPosPlane.dup().transformMat4(invViewMatrix);
      this.planeLines.addCross(from, 0.01, Color.Orange);
      this.planeLines.addCross(to, 0.01, Color.Orange);
      this.planeLines.addLine(from, to, Color.Orange);
      this.planeLines.addCross(fromPlane, 1, Color.Green);
      this.planeLines.addCross(toPlane, 1, Color.Green);
    }
    this.planeLines.addCross(target, 0.5, Color.Yellow);
    this.planeLines.vertices.dirty = true;
  },
  draw: function() {
    glu.enableDepthReadAndWrite(true);

    var gl = Context.currentContext;
    gl.lineWidth(3);

    glu.clearColorAndDepth(Color.Black);
    this.axisHelper.draw(this.camera);
    this.mesh.draw(this.camera);
    this.planeMesh.draw(this.camera);
  }
});