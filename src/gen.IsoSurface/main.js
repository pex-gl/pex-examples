var sys = require('pex-sys');
var glu = require('pex-glu');
var color = require('pex-color');
var materials = require('pex-materials');
var geom = require('pex-geom');
var gen = require('pex-gen');

var Window = sys.Window;
var Cube = gen.Cube;
var IsoSurface = gen.IsoSurface;
var Mesh = glu.Mesh;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Vec3 = geom.Vec3;
var Vec2 = geom.Vec2;
var Texture2D = glu.Texture2D;
var Time = sys.Time;

var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var FlatToonShading = materials.FlatToonShading;
var MatCap = materials.MatCap;

var DPI = 2;

Window.create({
  settings: {
    width: 1024 * DPI,
    height: 768 * DPI,
    type: '3d',
    fullscreen: sys.Platform.isBrowser,
    highdpi: DPI
  },
  init: function() {
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.meshes = [];

    var spheres = this.spheres = [
      { position: new Vec3(-0.2, 0, 0), radius: 0.2, force: 1.0 },
      { position: new Vec3( 0.3, 0, 0), radius: 0.25, force: 1.0 },
      { position: new Vec3( 0.3, 0.5, 0), radius: 0.3, force: 1.0 },
      { position: new Vec3( 0.0, -0.5, 0), radius: 0.4, force: 1.0 }
    ];

    var iso = this.iso = new IsoSurface(20, 1);
    var isoGeom = iso.update(spheres);

    var matCap = Texture2D.load('../../assets/textures/matcaps/plastic_red.jpg');

    this.meshes.push(new Mesh(isoGeom, new MatCap({ texture: matCap }), { triangles: true }));

    var boxGeom = new Cube();
    boxGeom.computeEdges();
    this.box = new Mesh(boxGeom, new SolidColor(), { lines: true });
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    Time.verbose = true;

    var cols = 3;
    var rows = 3;
    var index = 0;
    var dw = 1/cols * this.width;
    var dh = 1/rows * this.height;
    this.camera.setAspectRatio(dw/dh);
    this.box.draw(this.camera);

    this.spheres[0].position.y = 0.3*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[0].position.z = 0.2*Math.sin(Time.seconds*4+Math.PI/4)*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[0].position.x = 0.1*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[1].position.z = 0.5*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[1].position.y = 0.2*Math.sin(Time.seconds*3+Math.PI/4)*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[1].position.x = 0.1*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[2].position.x = 0.4*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[2].position.y = 0.5*Math.sin(Time.seconds*2+Math.PI/4)*Math.cos(Time.seconds*2+Math.PI/4)
    this.spheres[2].position.z = 0.1*Math.cos(Time.seconds*3+Math.PI/4)
    this.meshes[0].geom = this.iso.update(this.spheres);
    this.meshes[0].geom.computeEdges();

    for(var j=0; j<rows; j++) {
      for(var i=0; i<cols; i++) {
        var mesh = this.meshes[index++];
        //glu.viewport(i * dw, this.height - dh - j * dh, dw, dh);
        if (mesh) {
          mesh.draw(this.camera);
        }
      }
    }
  }
});