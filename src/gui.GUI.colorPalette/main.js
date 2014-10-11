var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var gui = require('pex-gui');

var Box = gen.Box;
var Dodecahedron = gen.Dodecahedron;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
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
  bgColor: Color.Black,
  init: function() {
    this.gui = new GUI(this);
    this.gui.addParam('BG color ', this, 'bgColor', { palette: '../../assets/palettes/example.png'})
    //this.gui.addParam('BG color ', this, 'bgColor', { palette: '../../assets/palettes/rainbow.jpg'})
    this.gui.addParam('BG color 2', this, 'bgColor')
  },
  draw: function() {
    glu.clearColorAndDepth(this.bgColor);
    this.gui.draw();
  }
});

