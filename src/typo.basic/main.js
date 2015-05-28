var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');

var Window = sys.Window;
var Color = color.Color;
var OrthographicCamera = glu.OrthographicCamera;
var Vec3 = geom.Vec3;

var typo = require('pex-typo');
var TextBox = typo.TextBox;

Window.create({
  settings: {
    width: 1280,
    height: 800
  },
  
  init: function() {
    this.textbox = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White });
    this.textbox.setPosition(20, 20);

    this.textbox2 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, drawDebug: true });
    this.textbox2.setPosition(690, 20);

    this.textbox3 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, drawDebug: true, drawFontMetrics: true });
    this.textbox3.setPosition(690, 180);


    this.textbox4 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, background: Color.DarkGrey, marginLeft: 40, marginRight: 40});
    this.textbox4.setPosition(20, 420);

    this.textbox5 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, background: Color.DarkGrey, marginLeft: 40, marginRight: 40, drawDebug: true });
    this.textbox5.setPosition(650, 420);


    this.textbox6 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, background: Color.DarkGrey, marginLeft: 40, marginRight: 40, marginTop: 20, marginBottom: 20});
    this.textbox6.setPosition(20, 570);

    this.textbox7 = new TextBox("Lorem ipsum", 'Arial', 96, { color: Color.White, background: Color.DarkGrey, marginLeft: 40, marginRight: 40, marginTop: 20, marginBottom: 20, drawDebug: true });
    this.textbox7.setPosition(650, 570);

    // Camera
    this.camera = new OrthographicCamera(0,0, this.width, this.height, 0.1, 100, null, Vec3.create(0, 0, 0), Vec3.create(0, 1, 0));
  },

  draw: function() {
    glu.viewport(0, 0, this.width, this.height);
    glu.enableAlphaBlending();
    glu.clearColorAndDepth(Color.Black);

    this.textbox.draw(this.camera);
    this.textbox2.draw(this.camera);
    this.textbox3.draw(this.camera);
    this.textbox4.draw(this.camera);
    this.textbox5.draw(this.camera);
    this.textbox6.draw(this.camera);
    this.textbox7.draw(this.camera);

  }

});