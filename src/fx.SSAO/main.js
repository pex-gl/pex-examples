var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var fx = require('pex-fx');

var Sphere = gen.Sphere;
var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var ShowDepth = materials.ShowDepth;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Context = glu.Context;
var Texture2D = glu.Texture2D;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d'
  },
  init: function() {
    this.camera = new PerspectiveCamera(60, this.width/this.height, 0.1, 10);
    this.arcball = new Arcball(this, this.camera, 2);

    this.showNormals = new ShowNormals();
    this.showDepth = new ShowDepth({ near: this.camera.getNear(), far: this.camera.getFar() });
    this.mesh = new Mesh(new Sphere(0.3), this.showNormals);

    this.instances = [];
    for(var i=0; i<10; i++) {
      this.instances.push(geom.randomVec3(0.35));
    }
    for(var i=0; i<10; i++) {
      this.instances.push(geom.randomVec3(1.05));
    }
  },
  drawColor: function() {
    this.gl.clearColor(0, 0, 0, 1);
    this.mesh.setMaterial(this.showNormals);
    this.drawScene();
  },
  drawDepth: function() {
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clearDepth(1.0);
    this.mesh.setMaterial(this.showDepth);
    this.drawScene();
    this.gl.clearDepth(1.0);
  },
  drawScene: function() {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    this.instances.forEach(function(pos) {
      this.mesh.position = pos;
      this.mesh.draw(this.camera);
    }.bind(this));
  },
  draw: function() {
    var gl = Context.currentContext;
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);

    //alternatively we could replace rendering depth with shared depth texture
    //var depthBuf = Texture2D.create(this.width, this.height, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });

    glu.viewport(0, 0, this.width, this.height);

    var root = fx();
    var color = root.render({ drawFunc: this.drawColor.bind(this), depth: true });
    var depth = color.render({ drawFunc: this.drawDepth.bind(this), bpp: 32, depth: true });
    var small = color.downsample4().downsample4();
    var blurred = small.blur5().blur5();
    var glowing = color.mult(blurred);
    var ssao = root.ssao({ depthMap: depth, camera: this.camera, strength: 1, offset: 0.0, width: this.width/2, height: this.height/2 }).blur3().blur3();
    var fin = color.mult(ssao);

    color.blit({x:0, y:0, width:this.width/2, height: this.height/2});
    small.blit({x:this.width/2, y:0, width:this.width/2, height: this.height/2});
    blurred.blit({x:0, y:this.height/2, width:this.width/2, height: this.height/2});
    ssao.blit({x:this.width/2, y:this.height/2, width:this.width/2, height: this.height/2});
    fin.blit({x : this.width*0.35, y:this.height/4, width:this.width*0.35,height:this.width*0.35*this.height/this.width});
  }
});

