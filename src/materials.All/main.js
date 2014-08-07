var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var gen = require('pex-gen');
var color = require('pex-color');
var materials = require('pex-materials');

var Window = sys.Window;
var Sphere = gen.Sphere;
var Cube = gen.Cube;
var Box = gen.Box;
var Mesh = glu.Mesh;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Vec3 = geom.Vec3;
var Vec2 = geom.Vec2;
var Texture2D = glu.Texture2D;
var TextureCube = glu.TextureCube;

var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var ShowColors = materials.ShowColors;
var TexturedTriPlanar = materials.TexturedTriPlanar;
var FlatToonShading = materials.FlatToonShading;
var MatCap = materials.MatCap;
var ShowDepth = materials.ShowDepth;
var Diffuse = materials.Diffuse;
var TexturedCubeMap = materials.TexturedCubeMap;

var DPI = 2;

Window.create({
  settings: {
    width: 1024 * DPI,
    height: 768 * DPI,
    type: '3d',
    fullscreen: sys.Platform.isBrowser,
    highdpi: DPI
  },
  init: function() {
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);

    this.meshes = [];

    var sphere = new Sphere(0.75);
    sphere = new Box();
    sphere = sphere.catmullClark();
    sphere = sphere.extrude(0.4);
    sphere = sphere.catmullClark().catmullClark();
    sphere.computeNormals();
    var sphereFlat = sphere.toFlatGeometry();
    sphereFlat.computeNormals();
    var colors = sphere.vertices.map(function() {
      return new Color(Math.random(), Math.random(), Math.random(), 1.0);
    })
    sphere.addAttrib('colors', 'color', colors);

    var cubeMapFiles = [
      '../../assets/cubemaps/uffizi/uffizi_cross_posx.jpg',
      '../../assets/cubemaps/uffizi/uffizi_cross_negx.jpg',
      '../../assets/cubemaps/uffizi/uffizi_cross_posy.jpg',
      '../../assets/cubemaps/uffizi/uffizi_cross_negy.jpg',
      '../../assets/cubemaps/uffizi/uffizi_cross_posz.jpg',
      '../../assets/cubemaps/uffizi/uffizi_cross_negz.jpg'
    ];

    var texture2D = Texture2D.load('../../assets/textures/plask.png', { repeat: true, mipmap: true });
    var colorBands = Texture2D.load('../../assets/textures/palette_green.png');
    var mapCap1 = Texture2D.load('../../assets/textures/matcaps/MatcapBronze.jpg');
    var mapCap2 = Texture2D.load('../../assets/textures/matcaps/generator11.jpg');
    var mapCap3 = Texture2D.load('../../assets/textures/matcaps/plastic_red.jpg');
    var mapCap4 = Texture2D.load('../../assets/textures/matcaps/green_glass_860.png');

    var cubeMap = TextureCube.load(cubeMapFiles);

    this.meshes.push(new Mesh(sphere, new SolidColor({ color: Color.Red }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new ShowNormals(), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new ShowColors(), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new TexturedTriPlanar({ texture: texture2D, scale: 2 }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new FlatToonShading({ colorBands: colorBands }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new ShowDepth({near: 0.5, far: 2}), { triangles: true }));
    this.meshes.push(new Mesh(sphereFlat, new Diffuse({near: 0.5, far: 2}), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new TexturedCubeMap({ texture: cubeMap }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new MatCap({ texture: mapCap1 }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new MatCap({ texture: mapCap2 }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new MatCap({ texture: mapCap3 }), { triangles: true }));
    this.meshes.push(new Mesh(sphere, new MatCap({ texture: mapCap4 }), { triangles: true }));
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);

    var cols = 4;
    var rows = 3;
    var index = 0;
    var dw = 1/cols * this.width;
    var dh = 1/rows * this.height;
    this.camera.setAspectRatio(dw/dh);
    for(var j=0; j<rows; j++) {
      for(var i=0; i<cols; i++) {
        glu.viewport(i * dw, this.height - dh - j * dh, dw, dh);
        var mesh = this.meshes[index++];
        if (mesh) {
          mesh.draw(this.camera);
        }
      }
    }
    glu.viewport(0, 0, this.width, this.height);
  }
});