var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var TexturedCubeMap = materials.TexturedCubeMap;
var SkyBox = materials.SkyBox;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var TextureCube = glu.TextureCube;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var cubeMapFiles = [
      '../../assets/textures/uffizi_cross_posx.jpg',
      '../../assets/textures/uffizi_cross_negx.jpg',
      '../../assets/textures/uffizi_cross_posy.jpg',
      '../../assets/textures/uffizi_cross_negy.jpg',
      '../../assets/textures/uffizi_cross_posz.jpg',
      '../../assets/textures/uffizi_cross_negz.jpg'
    ];
    var cubeMap = TextureCube.load(cubeMapFiles);
    this.mesh = new Mesh(new Sphere(), new TexturedCubeMap({ texture: cubeMap }));
    this.cubeMesh = new Mesh(new Cube(50), new SkyBox({ texture: cubeMap }));

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.cubeMesh.draw(this.camera);
    this.mesh.draw(this.camera);
  }
});