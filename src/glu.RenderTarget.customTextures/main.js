var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Platform = sys.Platform;
var Cube = gen.Cube;
var Mesh = glu.Mesh;
var Diffuse = materials.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var RenderTarget = glu.RenderTarget;
var Texture2D = glu.Texture2D;
var ScreenImage = glu.ScreenImage;
var Vec3 = geom.Vec3;

sys.Window.create({
  settings: {
    width: 1024,
    height: 512,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    var cube = new Cube(0.5);
    this.mesh = new Mesh(cube, new Diffuse( { diffuseColor: Color.Grey, ambientColor: Color.DarkGrey }));
    this.meshRight = new Mesh(cube, new Diffuse( { diffuseColor: Color.Red, ambientColor: Color.DarkGrey }));
    this.meshRight.position = new Vec3(1, 0, 0);
    this.meshTop = new Mesh(cube, new Diffuse( { diffuseColor: Color.Green, ambientColor: Color.DarkGrey }));
    this.meshTop.position = new Vec3(0, 1, 0);
    this.meshFront = new Mesh(cube, new Diffuse( { diffuseColor: Color.Blue, ambientColor: Color.DarkGrey }));
    this.meshFront.position = new Vec3(0, 0, 1);

    var rtWidth = Math.min(this.height, this.width/2);
    var rtHeight = Math.min(this.height, this.width/2);

    //create textures for offscreen rendering
    var colorBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE });
    var depthBuf = Texture2D.create(rtWidth, rtHeight, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });

    this.renderTarget = new RenderTarget(rtWidth, rtHeight, { color: colorBuf, depth: depthBuf });

    //create two ScreenImages to display rendered texture and depth buf on the screen
    this.screenImageColor = new ScreenImage(colorBuf, 0, 0, rtWidth, rtHeight, this.width, this.height);
    this.screenImageDepth = new ScreenImage(depthBuf, rtWidth, 0, rtWidth, rtHeight, this.width, this.height);

    this.camera = new PerspectiveCamera(60, rtWidth / rtHeight, 1, 10);
    this.arcball = new Arcball(this, this.camera);
    this.arcball.setPosition(new Vec3(1, 2, 3));
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);

    //always set the viewport to the size of the offscreen rendering
    glu.viewport(0, 0, this.renderTarget.width, this.renderTarget.height);
    this.renderTarget.bind();
    glu.clearColorAndDepth(Color.Black);
    this.mesh.draw(this.camera);
    this.meshRight.draw(this.camera);
    this.meshTop.draw(this.camera);
    this.meshFront.draw(this.camera);
    this.renderTarget.unbind();

    //set the viewport back to the full screen size after you are done
    glu.viewport(0, 0, this.width, this.height);

    this.screenImageColor.draw();
    this.screenImageDepth.draw();
  }
});