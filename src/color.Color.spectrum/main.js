var sys = require('pex-sys');
var color = require('pex-color');
var omgcanvas = require('omgcanvas');
var Window = sys.Window;
var Color = color.Color;
var Platform = sys.Platform;

Window.create({
  settings: {
    width: 1024,
    height: 550,
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
    ctx.fillStyle = Color.fromRGB(50/255, 50/255, 50/255, 1).getHex();
    ctx.fillRect(0, 0, this.width, this.height);

    var c = new Color();

    var numRect = 50;
    for(var i=0; i<numRect; i++) {
      ctx.save();

      var hue = i / numRect;
      var t = i / numRect;
      var step = 1 / numRect;

      ctx.translate(0, 10);
      c.set(t, 0.5, 0.5);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.set(0.5, t, 0.5);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.set(0.5, 0.5, t);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSV(hue, 1.0, 1.0);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSV(hue, 0.5, 1.0);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSV(hue, 1.0, 0.5);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSL(hue, 1.0, 0.8);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSL(hue, 0.5, 0.5);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.translate(0, 60);
      c.setHSL(hue, 1.0, 0.5);
      ctx.fillStyle = c.getHex();
      ctx.fillRect(this.width * t, 0, this.width * (t + step), 50);

      ctx.restore();
    }
  }
})
