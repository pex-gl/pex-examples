var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var color = require('pex-color');
var materials = require('pex-materials');
var gui = require('pex-gui');

var GUI = gui.GUI;
var Window = sys.Window;
var Cube = gen.Cube;
var Mesh = glu.Mesh;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Texture2D = glu.Texture2D;
var Time = sys.Time;

var Textured = materials.Textured;

var DPI = 1;

Window.create({
  settings: {
    width: 1024 * DPI,
    height: 768 * DPI,
    type: '3d',
    fullscreen: sys.Platform.isBrowser,
    highdpi: DPI
  },
  color: Color.create(0.2, 0.2, 0.2, 1),
  textureIndex: 0,
  init: function() {
    this.gui = new gui.GUI(this);
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    var textureNames = ['plask.png', 'opengl.png', 'noise.png', 'test.png', 'envmap.jpg', 'envmap_blur.jpg'];
    var textures = textureNames.map(function(file) {
      return Texture2D.load('../../assets/textures/' + file, { mipmap: true });
    });
    var textureItems = textures.map(function(texture, i) {
      return {
        texture: texture,
        name: textureNames[i],
        value: i
      };
    });

    this.textures = textures;
    this.material = new Textured({ texture: this.textures[this.textureIndex] })

    this.gui.addLabel('Settings');
    this.gui.addTextureList('TEXTURE', this, 'textureIndex', textureItems, 2, this.onTextureChanged.bind(this));
    this.gui.addLabel('Click one of the above')
    this.gui.addLabel('textures to choose it.')

    var gl = glu.Context.currentContext;
    this.mesh = new glu.Mesh(new Cube(), this.material);
  },
  onTextureChanged: function(idx) {
    this.material.uniforms.texture = this.textures[idx];
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true, true);

    this.mesh.draw(this.camera);

    this.gui.draw();
  }
});
