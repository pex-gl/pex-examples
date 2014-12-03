var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var random = require('pex-random');

var Cube = gen.Cube;
var Box = gen.Box;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Time = sys.Time;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Platform = sys.Platform;

var ShowNormalsInstanced = require('./materials/ShowNormalsInstanced');

var DPI = Platform.isPlask ? 2 : 1;

function prop(name) {
  return function(o) {
    return o[name];
  }
}

sys.Window.create({
  settings: {
    width: 1280*DPI,
    height: 720*DPI,
    type: '3d',
    highdpi: DPI
  },
  init: function() {
    this.framerate(70);

    random.seed(10)

    var base = new Box().catmullClark();
    base = base.extrude(0.15, base.faces.map(function(f, fi) { return fi;}).filter(function(fi) { return Math.random() > 0.72; }));
    base = base.catmullClark();
    var lowPolyBase = base.catmullClark()
    lowPolyBase.computeNormals();
    base = base.catmullClark().catmullClark().catmullClark();
    base.computeNormals();

    this.baseMesh = new Mesh(lowPolyBase, new SolidColor({ color: Color.Black }))
    //this.baseMesh = new Mesh(lowPolyBase, new ShowNormals({ color: Color.Black }))

    var cube = new Cube(0.005, 0.005, 0.1);
    this.mesh = new Mesh(cube, new ShowNormalsInstanced());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.instances = [];
    for(var i=0; i<base.vertices.length; i++) {
      var q =  Quat.fromDirection(base.normals[i])
      this.instances.push({
        axis: random.vec3(1).normalize(),
        scale: new Vec3(1,1,1),
        rotation: q,
        position: base.vertices[i]
      });
    }

    var offsets = this.instances.map(prop('position'));
    var rotations = this.instances.map(prop('rotation'));

    cube.addAttrib('offsets', 'offset', offsets, false, true);
    cube.addAttrib('rotations', 'rotation', rotations, false, true);

    var gl = this.gl;
  },
  draw: function() {
    Time.verbose = true;
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    var gl = this.gl;


    this.baseMesh.draw(this.camera);
    this.mesh.drawInstances(this.camera, this.instances);
    //this.mesh.draw(this.camera);

    this.gl.finish();
  }
});