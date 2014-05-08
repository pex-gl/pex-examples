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

var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var ShowColors = materials.ShowColors;
var Textured = materials.Textured;
var FlatToonShading = materials.FlatToonShading;
var MatCap = materials.MatCap;

var DPI = 1;

Window.create({
  settings: {
    width: 1024 * DPI,
    height: 768 * DPI,
    type: '3d',
    fullscreen: sys.Platform.isBrowser,
    highdpi: DPI
  },
  color: Color.create(0.2, 0.2, 0.4, 1),
  materials: [],
  materialIndex: 1,
  distance: 2,
  rotate: false,
  rotationAxis: Vec3.create(0, 1, 0),
  rotationSpeed: 1,
  rotationAngle: 0,
  viewport: new Vec2(1, 1),
  init: function() {
    this.gui = new gui.GUI(this);
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.texture = Texture2D.load('../../assets/textures/opengl.png');

    this.materials.push(new materials.SolidColor());
    //this.materials.push(new materials.ShowTexCoords());
    this.materials.push(new materials.ShowNormals());
    //this.materials.push(new materials.Diffuse());
    this.materials.push(new materials.Textured({ texture: this.texture }));
    this.materials.push(new materials.Textured({ texture: this.texture }));

    var gl = glu.Context.currentContext;
    this.mesh = new glu.Mesh(new Cube(), this.materials[1]);

    this.gui.addLabel('GUI Test');
    this.gui.addLabel('S - save settings');
    this.gui.addLabel('L - load settings');
    this.gui.addLabel('');

    this.gui.addLabel('CUBE');
    this.gui.addParam('Viewport', this, 'viewport');
    this.gui.addParam('Scale', this.mesh, 'scale');
    this.gui.addParam('Color', this, 'color');

    this.gui.addLabel('ROTATION');
    this.gui.addParam('Rotate', this, 'rotate');
    this.gui.addParam('Rotate speed', this, 'rotationSpeed', {min:0, max:5});
    this.gui.addLabel('CAMERA');
    this.gui.addParam('Distance', this, 'distance', {min:0.5, max:5});
    //this.gui.addTexture2D('Texture', this.texture);
    var radioList = this.gui.addRadioList('MATERIAL', this, 'materialIndex', [
      { name: 'None', value: 0 },
      //{ name:'Test', value:1 },
      //{ name:'TexCoords', value:2 },
      { name: 'Normal', value: 1 },
      //{ name:'Diffuse', value:4 },
      { name: 'Textured', value: 2 },
      { name: 'Textured with Alpha', value: 3 }
    ], function(idx) { console.log('Material changed', idx); }).setPosition(180, 10);

    //this.gui.load('client.gui.settings.txt'); //BUG

    var self = this;
    self.gui.load('client.gui.settings.txt');
    this.on('keyDown', function(e) {
      switch(e.str) {
        case 'S': self.gui.save('client.gui.settings.txt'); break;
        case 'L': self.gui.load('client.gui.settings.txt'); break;
      }
    });
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true, true);
    var gl = glu.Context.currentContext;

    this.arcball.distance = this.distance;
    this.arcball.updateCamera();

    var viewportWidth = Math.floor(this.viewport.x * this.width);
    var viewportHeight = Math.floor(this.viewport.y * this.height);

    glu.viewport((this.width - viewportWidth)/2, (this.height - viewportHeight)/2, viewportWidth, viewportHeight);

    if (this.rotate) {
      this.rotationAngle += Time.delta * this.rotationSpeed * 10;
      this.mesh.rotation.setAxisAngle(this.rotationAxis, this.rotationAngle);
    }

    this.mesh.setMaterial(this.materials[this.materialIndex]);

    if (this.materialIndex == 3) {
      glu.enableAdditiveBlending();
      glu.enableDepthReadAndWrite(false, false);
    }
    else {
      glu.enableDepthReadAndWrite(true, true);
      glu.enableBlending(false);
    }

    glu.clearColorAndDepth(this.color);
    this.mesh.draw(this.camera);

    glu.viewport(0, 0, this.width, this.height);
    this.gui.draw();
  }
});
