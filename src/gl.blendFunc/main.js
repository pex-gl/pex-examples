var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Vec3 = require('pex-geom').Vec3;
var ScreenImage = require('pex-glu').ScreenImage;
var Texture2D = require('pex-glu').Texture2D;
var GUI = require('pex-gui').GUI;


sys.Window.create({
  settings: {
    width: 820,
    height: 780,
    type: '3d'
  },
  init: function() {
    this.gui = new GUI(this);

    var gl = this.gl;
    this.blendModes = [
      gl.ZERO,
      gl.ONE,
      gl.SRC_COLOR,
      gl.ONE_MINUS_SRC_COLOR,
      gl.DST_COLOR,
      gl.ONE_MINUS_DST_COLOR,
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.DST_ALPHA,
      gl.ONE_MINUS_DST_ALPHA,
      gl.SRC_ALPHA_SATURATE
    ];

    this.blendModesNames = [
      ['ZERO',''],
      ['ONE',''],
      ['SRC_COLOR',''],
      ['ONE_MINUS','SRC_COLOR'],
      ['DST_COLOR', ''],
      ['ONE_MINUS', 'DST_COLOR'],
      ['SRC_ALPHA', ''],
      ['ONE_MINUS', 'SRC_ALPHA'],
      ['DST_ALPHA',''],
      ['ONE_MINUS', 'DST_ALPHA'],
      ['SRC_ALPHA', 'SATURATE']
    ];

    var size = 64;

    this.gui.addLabel('SRC').setPosition(10, 30);
    this.gui.addLabel('DST').setPosition(50, 10);

    for(var j=0; j<this.blendModes.length; j++) {
      var y = size + j * size + 20;
      this.gui.addLabel(this.blendModesNames[j][0]).setPosition(10, y)
      this.gui.addLabel(this.blendModesNames[j][1]).setPosition(10, y+16)
    }

    for(var i=0; i<this.blendModes.length; i++) {
      var x = 1.5*size + i * size + 20;
      this.gui.addLabel(this.blendModesNames[i][0]).setPosition(x, 10)
      this.gui.addLabel(this.blendModesNames[i][1]).setPosition(x, 10+16)
    }

    this.sprite = new ScreenImage(Texture2D.load('../../assets/textures/sprite_brush.png'));
    this.bg = new ScreenImage(Texture2D.load('../../assets/textures/grass.png'));
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);

    var gl = this.gl;
    gl.disable(gl.DEPTH_TEST);

    glu.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    this.gui.draw();

    //cell size
    var size = 64;
    for(var j=0; j<this.blendModes.length; j++) {
      var y = size + j * size;
      for(var i=0; i<this.blendModes.length; i++) {
        var x = 1.5*size + i * size;
        glu.viewport(x, this.height-y-size, size, size);
        gl.disable(gl.BLEND);
        this.bg.draw();
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendModes[j], this.blendModes[i]);
        this.sprite.draw();
      }
    }
  }
});
