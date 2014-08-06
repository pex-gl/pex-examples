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

    var cubeMapFiles = [
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m00_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m01_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m02_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m03_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m04_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m05_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m06_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m07_c05.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c00.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c01.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c02.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c03.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c04.png',
      '../../assets/cubemaps/uffizi_lod/uffizi_m08_c05.png'
    ];

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