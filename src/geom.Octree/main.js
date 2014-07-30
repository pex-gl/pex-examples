var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var helpers = require('pex-helpers');

var Octree = geom.Octree;
var OctreeHelper = helpers.OctreeHelper;
var Cube = gen.Cube;
var Vec3 = geom.Vec3;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;
var Time = sys.Time;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    this.pointMesh = new Mesh(new Cube(0.05), new SolidColor({ color: Color.Red }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 5);
    this.arcball.setTarget(new Vec3(1, 1, 0));
    this.arcball.setPosition(new Vec3(1, 1, 4));

    this.octree = new Octree(new Vec3(0, 0, 0), new Vec3(2, 2, 2));
    this.points = [];

    this.testNearest(this.octree);

    this.pointInstances = this.points.map(function(p) {
      return { position: p, uniforms: { color: Color.White } };
    })

    this.octreeHelper0 = new OctreeHelper(this.octree, Color.Green, 0);
    this.octreeHelper0.z = -0.01;
    this.octreeHelper1 = new OctreeHelper(this.octree, Color.Blue, 1);
    this.octreeHelper1.x = -0.01;
    this.octreeHelper2 = new OctreeHelper(this.octree, Color.Red, 2);
    this.octreeHelper2.x = 0.01;
    this.octreeHelper3 = new OctreeHelper(this.octree, Color.White, 3);

    this.on('mouseMoved', function(e){
      var ray = this.camera.getWorldRay(e.x, e.y, this.width, this.height);
      var hit = ray.hitTestPlane(new Vec3(0, 0, 1), new Vec3(0, 0, -1));
      if (hit.length > 0) {
        this.targetPoint = hit[0];
      }
      else {
        console.log('bla')
      }
    }.bind(this))
  },

  testNearest: function(octree) {
    var n = 100;

    geom.randomSeed(1);
    for(var i=0; i<n; i++) {
      var p = geom.randomVec3(1).add(new Vec3(1, 1, 1)); //move the points to (0,0,0),(2,2,2) box
      p.z = 1; //for easier debugging
      this.points.push(p);
    }

    this.points.forEach(function(p) {
      octree.add(p, Color.fromHSL(Math.random(), 1, 0.5));
    })

    console.log('this.nearestPoint', this.nearestPoint)
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.octreeHelper0.draw(this.camera);
    this.octreeHelper1.draw(this.camera);
    this.octreeHelper2.draw(this.camera);
    this.octreeHelper3.draw(this.camera);
    this.pointMesh.drawInstances(this.camera, this.pointInstances);

    if (!this.once) {
      this.targetPoint = new Vec3(1-0.51, 1, 1 + 0.49); //tricky edge case
      this.once = true;
    }

    var nearestResult = this.octree.findNearestPoint(this.targetPoint, { includeData: true });
    this.nearestPoint = nearestResult.point;

    if (this.targetPoint) this.pointMesh.drawInstances(this.camera, [ { position: this.targetPoint, uniforms: { color: nearestResult.data } }]);
    if (this.nearestPoint) this.pointMesh.drawInstances(this.camera, [ { position: this.nearestPoint, uniforms: { color: nearestResult.data  }, scale: new Vec3(1.1, 1.1, 1.1) }]);
  }
});
