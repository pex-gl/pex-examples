var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec2 = geom.Vec2;
var merge = require('merge');
var fs = require('fs');

var TexturedLodGLSL = fs.readFileSync(__dirname + '/TexturedLod.glsl', 'utf8');

function TexturedLod(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(TexturedLodGLSL);
  var defaults = {
    scale: new Vec2(1, 1)
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

TexturedLod.prototype = Object.create(Material.prototype);

module.exports = TexturedLod;
