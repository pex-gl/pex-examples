var sys = require('pex-sys');
var geom = require('pex-geom');
var color = require('pex-color');
var random = require('pex-random');
var omgcanvas = require('omgcanvas');

var Path = geom.Path;
var Spline3D = geom.Spline3D;
var Vec3 = geom.Vec3;
var Color = color.Color;
var Platform = sys.Platform;

sys.Window.create({
  settings: {
    type: '2d3d',
    fullscreen: sys.Platform.isBrowser
  },
  mousePos: new Vec3(0, 0, 0),
  init: function() {
    random.seed(1);
    var numPoints = 10;
    this.points = [];
    for(var i=0; i<numPoints; i++) {
      this.points.push(new Vec3(random.float(this.width*0.1, this.width*0.9), random.float(this.height*0.2, this.height*0.8), 0));
    }
    this.points.sort(function(a, b) {
      return a.x - b.x;
    })
    this.path = new Path(this.points);
    this.spline = new Spline3D(this.points);
    this.splinePoints = [];
    for(var i=0; i<100; i++) {
      this.splinePoints.push(this.spline.getPointAt(i/100));
    }

    this.on('mouseMoved', this.mouseMoved.bind(this));

    if (Platform.isBrowser) {
      this.context = this.canvas.getContext('2d');
    }
    else { //Plask
      //create HTML Canvas wrapper on top of Skia SkCanvas
      this.context = new omgcanvas.CanvasContext(this.canvas);
    }
  },
  mouseMoved: function(e) {
    this.mousePos.x = e.x;
    this.mousePos.y = e.y;
  },
  drawPoints: function(points, color) {
    var ctx = this.context;
    ctx.strokeStyle = color.getHex();
    var prevPoint = null;
    points.forEach(function(p) {
      if (prevPoint) {
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.strokeRect(p.x-3, p.y-3, 6, 6);
      prevPoint = p;
    });
  },
  draw: function() {
    var ctx = this.context;
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawPoints(this.points, Color.Red);
    this.drawPoints(this.splinePoints, Color.Green);

    ctx.strokeStyle = "#FF00FF";
    ctx.strokeRect(this.mousePos.x-10, this.mousePos.y-10, 20, 20);

    var closestPoint = this.path.getClosestPoint(this.mousePos);
    ctx.strokeStyle = "#AA0000";
    ctx.strokeRect(closestPoint.x-10, closestPoint.y-10, 20, 20);
    ctx.beginPath();
    ctx.moveTo(closestPoint.x, closestPoint.y);
    ctx.lineTo(this.mousePos.x, this.mousePos.y);
    ctx.stroke();

    var closesSplinePoint = this.spline.getClosestPoint(this.mousePos);
    ctx.strokeStyle = "#00AA00";
    ctx.strokeRect(closesSplinePoint.x-8, closesSplinePoint.y-8, 16, 16);
    ctx.beginPath();
    ctx.moveTo(closesSplinePoint.x, closesSplinePoint.y);
    ctx.lineTo(this.mousePos.x, this.mousePos.y);
    ctx.stroke();
  }
})
