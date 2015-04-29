var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');
var helpers = require('pex-helpers');

var Window = sys.Window;
var Color = color.Color;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Time = sys.Time;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var AxisHelper = helpers.AxisHelper;

var typo = require('pex-typo');
var TextBox = typo.TextBox;


Window.create({
  settings: {
    width: 1280,
    height: 800
  },
  
  init: function() {

    var scale = 0.001;

    this.textbox1 = new TextBox("Lorem ipsum", 'Arial', 96, { origin: TextBox.Origin.Center, scale: scale });
    this.textbox1.setPosition(400*scale, 150*scale);

    this.textbox2 = new TextBox("Lorem ipsum", 'Arial', 96, { scale: scale });
    this.textbox2.setPosition(600*scale, 330*scale);

    this.textbox3 = new TextBox("Lorem ipsum", 'Arial', 96, { scale: scale });
    this.textbox3.setPosition(150*scale, 270*scale);

    this.textbox4 = new TextBox("Lorem ipsum", 'Arial', 96, { origin: TextBox.Origin.Right, scale: scale });
    this.textbox4.setPosition(1150*scale, 550*scale);

    this.textbox5 = new TextBox("Lorem ipsum 3D", 'Arial', 96, { origin: TextBox.Origin.Center, scale: scale, anisotropy: 2 });
    this.textbox5.setPosition(0.1,0.2,0.5);

    // Camera
    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
    this.axis = new AxisHelper(2);

    Time.startMeasuringTime();
  },

  draw: function() {
    var gl = glu.Context.currentContext;
    glu.viewport(0, 0, this.width, this.height);
    glu.enableDepthReadAndWrite(true);
    glu.enableAlphaBlending();
    glu.clearColorAndDepth(Color.Black);

    var a = Math.sin( Time.seconds ) * 5.0;

    this.textbox1.setRotation( a );
    this.textbox2.setRotation( Quat.fromAxisAngle(Vec3.create(0,0,1), -30+a) );
    this.textbox3.setRotation( 30+a );
    this.textbox4.setRotation( -15+a );
    
    this.textbox5.setRotation( Quat.fromAxisAngle(Vec3.create(1,0,0), Time.seconds*50) );

    this.textbox1.draw(this.camera);
    this.textbox2.draw(this.camera);
    this.textbox3.draw(this.camera);
    this.textbox4.draw(this.camera);
    this.textbox5.draw(this.camera);

    this.axis.draw(this.camera);

  }

});