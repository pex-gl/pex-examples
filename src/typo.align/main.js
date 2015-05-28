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

    var textboxPresets = this.textboxPresets = [];

    textboxPresets['default'] = {
    };
    textboxPresets['top-right'] = {
      align: TextBox.Align.Right,
      alignVertical: TextBox.Align.Top,
      height: 100
    };
    textboxPresets['top-center'] = {
      align: TextBox.Align.Center,
      alignVertical: TextBox.Align.Top,
      height: 100
    };
    textboxPresets['center'] = {
      align: TextBox.Align.Center,
      alignVertical: TextBox.Align.Center,
      height: 100
    };
    textboxPresets['bottom-center'] = {
      align: TextBox.Align.Center,
      alignVertical: TextBox.Align.Bottom,
      height: 100
    };

    textboxPresets['width-left'] = {
      align: TextBox.Align.Left,
      alignVertical: TextBox.Align.Center,
      width: 600,
      height: 100
    };
    textboxPresets['width-right'] = {
      align: TextBox.Align.Right,
      alignVertical: TextBox.Align.Center,
      width: 600,
      height: 100
    };
    
    this.textboxes = [];
    for(textboxPresetName in textboxPresets) {
    	textboxPreset = textboxPresets[textboxPresetName];

      textboxPreset.drawDebug = true;
      // textboxPreset.drawFontMetrics = true;

	    var textbox = new TextBox("Lorem ipsum lorem ipsum\rdolor sit amet", "Arial", 24, textboxPreset);
      this.textboxes[textboxPresetName] = textbox;
    }

    // Layout
    this.textboxes['top-right'].setPosition(this.width/2-10, 60);
    this.textboxes['default'].setPosition(this.width/2+10, 60);
    this.textboxes['top-center'].setPosition(this.width/2, 180);
    this.textboxes['center'].setPosition(this.width/2, 350);
    this.textboxes['bottom-center'].setPosition(this.width/2, 520);
    this.textboxes['width-left'].setPosition(this.width/2, 590);
    this.textboxes['width-right'].setPosition(this.width/2, 710);

    // Description
    this.desc = new TextBox("Type your text and watch different behaviors. Press `CMD + d` to toggle debug info drawing.", 'Arial', 14, { color: Color.LightGrey });
    this.desc.setPosition(20, 20);

    // Camera
    this.camera = new OrthographicCamera(0,0, this.width, this.height, 0.1, 100, null, Vec3.create(0, 0, 0), Vec3.create(0, 1, 0));

    // Keybinding
    this.on('keyDown', function(e) {
    	if(e.keyCode == 51) { // BACKSPACE to clear
			for(textboxPresetName in this.textboxes) {
				var text = this.textboxes[textboxPresetName].text;
				if(text.length > 0) {
					text = text.substr(0, text.length-1);
			    	this.textboxes[textboxPresetName].update( text );
			    }
		    }
    	} else if(e.cmd && e.str == 'd') { // CMD + d to toggle debug info drawing
    		for(textboxPresetName in this.textboxes) {
		    	this.textboxes[textboxPresetName].options.drawDebug = !this.textboxes[textboxPresetName].options.drawDebug;
		    	this.textboxes[textboxPresetName].update( this.textboxes[textboxPresetName].text );
		    }
			
    	} else {
			for(textboxPresetName in this.textboxes) {
				this.textboxes[textboxPresetName].text += e.str;
		    	this.textboxes[textboxPresetName].update( this.textboxes[textboxPresetName].text );
		    }
		}
    }.bind(this));
  },

  draw: function() {
    glu.viewport(0, 0, this.width, this.height);
    glu.enableAlphaBlending();
    glu.clearColorAndDepth(Color.Black);

    this.desc.draw(this.camera);

    for(textboxPresetName in this.textboxes) {
    	this.textboxes[textboxPresetName].draw(this.camera);
    }

  }

});