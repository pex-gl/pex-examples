var sys = require('pex-sys');
var color = require('pex-color');
var Window = sys.Window;
var Color = color.Color;

Window.create({
  settings: {
    width: 1024,
    height: 550,
    type: '2d'
  },
  init: function() {

  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;
    paint.setFill();
    canvas.drawColor(50, 50, 50, 255);

    var c = new Color();

    var numRect = 50;
    for(var i=0; i<numRect; i++) {
      canvas.save();

      var hue = i / numRect;
      var t = i / numRect;
      var step = 1 / numRect;

      canvas.translate(0, 10);
      c.set(t, 0.5, 0.5);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.set(0.5, t, 0.5);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.set(0.5, 0.5, t);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSV(hue, 1.0, 1.0);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSV(hue, 0.5, 1.0);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSV(hue, 1.0, 0.5);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSL(hue, 1.0, 0.8);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSL(hue, 0.5, 0.5);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.translate(0, 60);
      c.setHSL(hue, 1.0, 0.5);
      paint.setColor(c.r * 255, c.g * 255, c.b * 255, 255);
      canvas.drawRect(paint, this.width * t, 0, this.width * (t + step), 50);

      canvas.restore();
    }
  }
})