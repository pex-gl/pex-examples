var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var gui = require('pex-gui');

var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Mesh = glu.Mesh;
var TexturedCubeMap = materials.TexturedCubeMap;
var SkyBox = materials.SkyBox;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var TextureCube = glu.TextureCube;
var GUI = gui.GUI;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  lod: 0,
  init: function() {
    this.gui = new GUI(this);
    this.gui.addParam('LOD', this, 'lod', { min: 0, max: 8 });

    var levels = ['m00', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'];
    var sides = ['c00', 'c01', 'c02', 'c03', 'c04', 'c05'];

    var cubeMapFiles = [];
    levels.forEach(function(level) {
      sides.forEach(function(side) {
        cubeMapFiles.push('../../assets/cubemaps/uffizi_lod/uffizi_' + level + '_' + side + '.png');
      });
    });

    var cubeMap = TextureCube.load(cubeMapFiles, { mipmap : true });
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
    this.mesh.material.uniforms.lod = this.lod;

    this.gui.draw();
  }
});