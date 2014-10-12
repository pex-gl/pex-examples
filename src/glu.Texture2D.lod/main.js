var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var Textured = materials.Textured;
var TexturedLod = require('./TexturedLod');
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Texture2D = glu.Texture2D;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var cube = new Cube();
    cube.computeEdges();
    var tex = Texture2D.load('../../assets/textures/noise.png', { mipmap: true, nearest: false } );
    this.mesh = new Mesh(cube, new TexturedLod({ texture: tex }), { triangles: true });
    this.mesh.position.x = -0.5;
    this.mesh.position.y =  -0.5;

    var tex2 = Texture2D.load('../../assets/textures/noise.png', { mipmap: false, nearest: false } );
    this.mesh2 = new Mesh(cube, new Textured({ texture: tex2 }), { triangles: true });
    this.mesh2.position.x =  0.5;
    this.mesh2.position.y =  -0.5;

    var tex3 = Texture2D.load('../../assets/textures/noise.png', { mipmap: false, nearest: true } );
    this.mesh3 = new Mesh(cube, new Textured({ texture: tex3 }), { triangles: true });
    this.mesh3.position.y =  0.5;

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.mesh.draw(this.camera);
    this.mesh2.draw(this.camera);
    this.mesh3.draw(this.camera);
  }
});