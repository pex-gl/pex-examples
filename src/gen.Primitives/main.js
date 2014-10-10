var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Plane = gen.Plane;
var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Cylinder = gen.Cylinder;
var Tetrahedron = gen.Tetrahedron;
var Octahedron = gen.Octahedron;
var Icosahedron = gen.Icosahedron;
var Dodecahedron = gen.Dodecahedron;
var HexSphere = gen.HexSphere;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Rect = geom.Rect;
var Vec3 = geom.Vec3;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var shapes = [
      new Plane(), new Plane(1,1,3,3),
      new Cube(), new Cube(1,1,1,3,3,3),
      new Cylinder(),
      new Tetrahedron(),
      new Octahedron(),
      new Icosahedron(),
      new Dodecahedron().triangulate(), //we can't render 5 vertex faces otherwise
      new Sphere(0.5, 8, 8), new Sphere(),
      new HexSphere(0.5, 1).triangulate(), new HexSphere(0.5, 2).triangulate()
    ];

    var objects = [];

    var numRows = 3;
    var shapesPerRow = 5;

    var W = this.width;
    var H = this.height;

    this.objects = shapes.map(function(g, i) {
      var x = i % shapesPerRow;
      var y = Math.floor(i/shapesPerRow);

      return {
        fillMesh: new Mesh(g, new SolidColor({ color: Color.Grey })),
        edgesMesh: new Mesh(g, new SolidColor({ color: Color.Yellow }), { lines: true }),
        viewport: new Rect(x * W/shapesPerRow, H - y*H/numRows - H/numRows, W/shapesPerRow, H/numRows)
      }
    })
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 2);
    this.arcball.setPosition(new Vec3(1.2, 0.7, 1.2))
  },
  draw: function() {
    glu.viewport(0, 0, this.width, this.height);
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    glu.cullFace();

    this.objects.forEach(function(o) {
      glu.viewport(o.viewport.x, o.viewport.y, o.viewport.width, o.viewport.height);
      this.camera.setAspectRatio(o.viewport.width / o.viewport.height)
      o.fillMesh.draw(this.camera);
      o.edgesMesh.draw(this.camera);
    }.bind(this))
  }
});
