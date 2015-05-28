var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');

var Window = sys.Window;
var Color = color.Color;
var OrthographicCamera = glu.OrthographicCamera;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Time = sys.Time;

var typo = require('pex-typo');
var TextBox = typo.TextBox;


Window.create({
  settings: {
    width: 1280,
    height: 800
  },
  
  init: function() {
    this.textbox1 = new TextBox("Lorem ipsum", 'Arial', 96, { origin: TextBox.Origin.Center, drawDebug: true });
    this.textbox1.setPosition(400, 150);

    this.textbox2 = new TextBox("Lorem ipsum", 'Arial', 96, { drawDebug: true });
    this.textbox2.setPosition(600, 330);

    this.textbox3 = new TextBox("Lorem ipsum", 'Arial', 96, { drawDebug: true });
    this.textbox3.setPosition(150, 270);

    this.textbox4 = new TextBox("Lorem ipsum", 'Arial', 96, { origin: TextBox.Origin.Right, drawDebug: true });
    this.textbox4.setPosition(1150, 550);

    // Camera
    this.camera = new OrthographicCamera(0,0, this.width, this.height, 0.1, 100, null, Vec3.create(0, 0, 0), Vec3.create(0, 1, 0));

    Time.startMeasuringTime();
  },

  draw: function() {
    glu.viewport(0, 0, this.width, this.height);
    glu.enableAlphaBlending();
    glu.clearColorAndDepth(Color.Black);

    var a = Math.sin( Time.seconds ) * 5.0;

    this.textbox1.setRotation( a );
    this.textbox2.setRotation( Quat.fromAxisAngle(Vec3.create(0,0,1), -30+a) );
    this.textbox3.setRotation( 30+a );
    this.textbox4.setRotation( -15+a );

    this.textbox1.draw(this.camera);
    this.textbox2.draw(this.camera);
    this.textbox3.draw(this.camera);
    this.textbox4.draw(this.camera);

  }

});