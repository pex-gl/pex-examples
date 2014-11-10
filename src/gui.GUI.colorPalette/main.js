var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var gui = require('pex-gui');

var Cube = gen.Cube;
var Dodecahedron = gen.Dodecahedron;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var GUI = gui.GUI;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  bgColor: Color.fromRGB(0, 0, 0),
  cubeColor: Color.fromRGB(1, 1, 1),
  init: function() {
    this.gui = new GUI(this);
    this.gui.addParam('BG color ', this, 'bgColor', { palette: '../../assets/palettes/example.png'})
    this.gui.addParam('Cube Color', this, 'cubeColor', { palette: '../../assets/palettes/rainbow.jpg'})

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
    this.mesh = new Mesh(new Cube(), new SolidColor({ color: this.cubeColor }));
  },
  draw: function() {
    glu.clearColorAndDepth(this.bgColor);
    this.mesh.draw(this.camera);
    this.gui.draw();
  }
});

