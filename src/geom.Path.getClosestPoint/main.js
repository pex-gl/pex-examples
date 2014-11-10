var sys = require('pex-sys');
var geom = require('pex-geom');
var color = require('pex-color');
var random = require('pex-random');

var Path = geom.Path;
var Spline3D = geom.Spline3D;
var Vec3 = geom.Vec3;
var Color = color.Color;

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
  },
  mouseMoved: function(e) {
    this.mousePos.x = e.x;
    this.mousePos.y = e.y;
  },
  drawPoints: function(points, color) {
    var canvas = this.canvas;
    var paint = this.paint;
    paint.setStroke();
    paint.setColor(color.r*255, color.g*255, color.b*255, 255);
    paint.setAntiAlias(true);
    var prevPoint = null;
    points.forEach(function(p) {
      if (prevPoint) {
        canvas.drawLine(paint, prevPoint.x, prevPoint.y, p.x, p.y);
      }
      canvas.drawRect(paint, p.x-3, p.y-3, p.x+3, p.y+3);
      prevPoint = p;
    });
  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;
    canvas.drawColor(255, 255, 255, 255);

    this.drawPoints(this.points, Color.Red);
    this.drawPoints(this.splinePoints, Color.Green);

    paint.setColor(255, 0, 255, 255);
    canvas.drawRect(paint, this.mousePos.x-10, this.mousePos.y-10, this.mousePos.x+10, this.mousePos.y+10);

    var closestPoint = this.path.getClosestPoint(this.mousePos);
    paint.setColor(150, 0, 0, 255);
    canvas.drawRect(paint, closestPoint.x-10, closestPoint.y-10, closestPoint.x+10, closestPoint.y+10);
    canvas.drawLine(paint, closestPoint.x, closestPoint.y, this.mousePos.x, this.mousePos.y);

    var closesSplinePoint = this.spline.getClosestPoint(this.mousePos);
    paint.setColor(0, 150, 0, 255);
    canvas.drawRect(paint, closesSplinePoint.x-8, closesSplinePoint.y-8, closesSplinePoint.x+8, closesSplinePoint.y+8);
    canvas.drawLine(paint, closesSplinePoint.x, closesSplinePoint.y, this.mousePos.x, this.mousePos.y);
  }
})
