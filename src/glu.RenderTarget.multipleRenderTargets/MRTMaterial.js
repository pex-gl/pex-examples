var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec3 = geom.Vec3;
var merge = require('merge');
var fs = require('fs');

var MRTMaterialGLSL = fs.readFileSync(__dirname + '/MRTMaterial.glsl', 'utf8');

function MRTMaterial(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(MRTMaterialGLSL);
  var defaults = {
    wrap: 0,
    pointSize: 1,
    lightPos: Vec3.create(10, 20, 30),
    ambientColor: Color.create(0, 0, 0, 1),
    diffuseColor: Color.create(1, 1, 1, 1)
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

MRTMaterial.prototype = Object.create(Material.prototype);

module.exports = MRTMaterial;