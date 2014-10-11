var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');
var gui = require('pex-gui');
var helpers = require('pex-helpers');

var Vec3 = geom.Vec3;
var Loft = gen.Loft;
var Spline3D = geom.Spline3D;
var Path = geom.Path;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var ShowColors = materials.ShowColors;
var Diffuse = materials.Diffuse;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Context = glu.Context;
var GUI = gui.GUI;
var FaceNormalHelper = helpers.FaceNormalHelper;

var points = [
  { x: 9.18454765366783e-17, y: 1.5, z: 0 },
  { x: 0.3882285676537811, y: 1.4488887394336025, z: 0 },
  { x: 0.7499999999999998, y: 1.299038105676658, z: 0.2 },
  { x: 1.0606601717798214, y: 1.0606601717798212, z: 0 },
  { x: 1.299038105676658, y: 0.75, z: 0 },
  { x: 1.4488887394336025, y: 0.388228567653781, z: 0 },
  { x: 1.5, y: 0, z: 0 },
  { x: 1.4488887394336025, y: -0.388228567653781, z: 0 },
  { x: 1.338550514724323, y: -0.7728124999999998, z: 0 },
  { x: 1.1689358976490114, y: -1.1689358976490112, z: 0.2 },
  { x: 0.7778124999999998, y: -1.3472107687621675, z: 0.3 },
  { x: 0.39874309136107133, y: -1.4881294761265955, z: 0.5 },
  { x: 1.0837766231328038e-16, y: -1.77, z: 0 },
  { x: -0.4100664245843065, y: -1.5303887310267428, z: 0.2 },
  { x: -0.7824999999999996, y: -1.3553297569226466, z: 0.1 },
  { x: -1.1702617228637355, y: -1.1702617228637369, z: -0.1 },
  { x: -2.1179733781303174, y: -1.222812500000001, z: 0 },
  { x: -1.5726479859268894, y: -0.42138975780754134, z: 0 },
  { x: -1.54125, y: -1.887424542828739e-16, z: 0 },
  { x: -1.4669998486765228, y: 0.3930814247494528, z: -0.3 },
  { x: -1.3298902606864786, y: 0.7678125000000002, z: -0.5 },
  { x: -1.0606601717798214, y: 1.0606601717798212, z: -0.3 },
  { x: -0.7500000000000007, y: 1.2990381056766576, z: 0 },
  { x: -0.3882285676537823, y: 1.448888739433602, z: 0 }
];

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  debug: false,
  light: false,
  init: function() {
    var shapePath = new Path([
      new Vec3(-0.1, -0.4, 0),
      new Vec3( 0.1, -0.4, 0),
      new Vec3( 0.1,  0.4, 0),
      new Vec3(-0.1,  0.4, 0)
    ]);
    points.forEach(function(p) {
      p.z = 0;
    })
    var spline = new Spline3D(points, true);

    this.gui = new GUI(this);
    this.gui.addParam('Debug', this, 'debug');
    this.gui.addParam('Light', this, 'light');

    var loft = new Loft(spline, { shapePath: shapePath, caps: true, numSteps: 200, numSegments: 4, closed: true });
    var flatLoft = loft.toFlatGeometry();
    flatLoft.computeNormals();
    this.normalMesh = new Mesh(flatLoft, new ShowNormals());

    this.mesh = new Mesh(flatLoft, new Diffuse({ diffuseColor: Color.Red, lightPos: new Vec3(0, 1, 10)}));
    this.debugLinesMesh = new Mesh(loft.toDebugLines(0.2), new ShowColors(), { lines: true });
    this.debugNormalsMesh = new FaceNormalHelper(flatLoft);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera, 4);
  },
  draw: function() {
    var gl = Context.currentContext;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    if (this.debug) {
      this.debugLinesMesh.draw(this.camera);
      this.debugNormalsMesh.draw(this.camera);
    }

    if (this.light) {
      this.mesh.draw(this.camera);
    }
    else {
      this.normalMesh.draw(this.camera);
    }

    this.gui.draw();
  }
});

