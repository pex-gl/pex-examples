var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Cube = gen.Cube;
var Plane = gen.Plane;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Rect = geom.Rect;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    var shapes = [ new Plane(), new Plane(1,1,3,3), new Cube(), new Cube(1,1,1,3,3,3), new Sphere() ];

    var objects = [];

    var numRows = 2;
    var shapesPerRow = 4;

    var W = this.width;
    var H = this.height;

    this.objects = shapes.map(function(g, i) {
      var x = i % shapesPerRow;
      var y = Math.floor(i/shapesPerRow);
      
      g.computeEdges();
      return {
        fillMesh: new Mesh(g, new SolidColor({ color: Color.Grey })),
        edgesMesh: new Mesh(g, new SolidColor({ color: Color.Yellow }), { lines: true }),
        viewport: new Rect(x * W/shapesPerRow, H - y*H/numRows - H/numRows, W/shapesPerRow, H/numRows)
      }
    })
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 2.5);
  },
  draw: function() {
    glu.viewport(0, 0, this.width, this.height);
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    this.objects.forEach(function(o) {
      glu.viewport(o.viewport.x, o.viewport.y, o.viewport.width, o.viewport.height);
      this.camera.setAspectRatio(o.viewport.width / o.viewport.height)
      o.fillMesh.draw(this.camera);
      o.edgesMesh.draw(this.camera);
    }.bind(this))
  }
});