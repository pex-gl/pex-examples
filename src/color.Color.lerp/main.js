var sys = require('pex-sys');
var color = require('pex-color');
var omgcanvas = require('omgcanvas');

var Color = color.Color;
var Platform = sys.Platform;

function range(min, max) {
  var result = [];
  for(var i=min; i<=max; i++) {
    result.push(i);
  }
  return result;
}

function remap(value, oldMin, oldMax, newMin, newMax) {
  return newMin + (value - oldMin) / (oldMax - oldMin) * (newMax - newMin);
}

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '2d',
    fullscreen: sys.Platform.isBrowser
  },
  init: function() {
    if (Platform.isBrowser) {
      this.context = this.canvas.getContext('2d');
    }
    else { //Plask
      //create HTML Canvas wrapper on top of Skia SkCanvas
      this.context = new omgcanvas.CanvasContext(this.canvas);
    }
  },
  draw: function() {
    var ctx = this.context;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.width, this.height);

    var startColor = Color.fromHSL(0.19, 0.4, 0.5);
    var endColor = Color.fromHSL(0.7, 0.4, 0.5);

    var startColor2 = Color.fromHSL(0.0, 0.8, 0.5);
    var endColor2 = Color.fromHSL(0.05, 0.8, 0.8);

    var numSteps = 20;
    var margin = 10;
    var windowWidth = this.width;
    var rectWidth = (windowWidth - margin*2) / numSteps;
    var rectHeight =  50;

    var rgbColors = range(0, numSteps).map(function(i) { return Color.lerp(startColor, endColor, i/(numSteps-1), 'rgb'); });
    var hsvColors = range(0, numSteps).map(function(i) { return Color.lerp(startColor, endColor, i/(numSteps-1), 'hsv'); });
    var hslColors = range(0, numSteps).map(function(i) { return Color.lerp(startColor, endColor, i/(numSteps-1), 'hsl'); });

    var rgbColors2 = range(0, numSteps).map(function(i) { return Color.lerp(startColor2, endColor2, i/(numSteps-1), 'rgb'); });
    var hsvColors2 = range(0, numSteps).map(function(i) { return Color.lerp(startColor2, endColor2, i/(numSteps-1), 'hsv'); });
    var hslColors2 = range(0, numSteps).map(function(i) { return Color.lerp(startColor2, endColor2, i/(numSteps-1), 'hsl'); });

    function drawRects(colors) {
      colors.forEach(function(color, colorIndex) {
        ctx.fillStyle = color.getHex();
        var x = remap(colorIndex, 0, colors.length, margin, windowWidth - 2 * margin);

        ctx.fillRect(x, 0, rectWidth, rectHeight);
      });
    }

    ctx.save();

    ctx.translate(0, margin);
    drawRects(rgbColors);

    ctx.translate(0, margin + rectHeight);
    drawRects(hsvColors);

    ctx.translate(0, margin + rectHeight);
    drawRects(hslColors);

    ctx.translate(0, margin + rectHeight);
    drawRects(rgbColors2);

    ctx.translate(0, margin + rectHeight);
    drawRects(hsvColors2);

    ctx.translate(0, margin + rectHeight);
    drawRects(hslColors2);

    ctx.restore();
  }
});
