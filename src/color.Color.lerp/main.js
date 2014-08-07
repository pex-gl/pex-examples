var sys = require('pex-sys');
var color = require('pex-color');
var Color = color.Color;

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
    type: '2d'
  },
  init: function() {
  },
  drawRect: function(x, y, w, h, color) {
  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;
    canvas.drawColor(0, 0, 0, 255);

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
      paint.setFill();
      colors.forEach(function(color, colorIndex) {
        paint.setColor(color.r * 255, color.g * 255, color.b * 255, 255);
        var x = remap(colorIndex, 0, colors.length, margin, windowWidth - 2 * margin);
        canvas.drawRect(paint, x, 0, x + rectWidth, rectHeight);
      });
    }

    canvas.save();

    canvas.translate(0, margin);
    drawRects(rgbColors);

    canvas.translate(0, margin + rectHeight);
    drawRects(hsvColors);

    canvas.translate(0, margin + rectHeight);
    drawRects(hslColors);

    canvas.translate(0, margin + rectHeight);
    drawRects(rgbColors2);

    canvas.translate(0, margin + rectHeight);
    drawRects(hsvColors2);

    canvas.translate(0, margin + rectHeight);
    drawRects(hslColors2);

    canvas.restore();
  }
});