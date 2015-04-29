var sys = require('pex-sys');
var glu = require('pex-glu');
var geom = require('pex-geom');
var color = require('pex-color');

var Window = sys.Window;
var Color = color.Color;
var OrthographicCamera = glu.OrthographicCamera;
var Vec2 = geom.Vec2;
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
    	maxLines: 1,
		background: Color.DarkGrey
    };
    textboxPresets['defined-width'] = {
      	width:    600,
      	maxLines: 1,
		background: Color.DarkGrey
    };
    textboxPresets['defined-width-limit'] = {
      	width:    600,
      	overflow: TextBox.Overflow.Limit,
    	maxLines: 1,
		background: Color.DarkGrey
    };
    textboxPresets['defined-width-and-height'] = {
      	width:    600,
      	height:   100,
      	maxLines: 3,
		background: Color.DarkGrey
    };
    textboxPresets['defined-width-and-height-scale-text'] = {
		width:    1220,
		height:   180,
		overflow: TextBox.Overflow.ScaleText,
		background: Color.DarkGrey,

		fontSize: 180
    };
    textboxPresets['defined-width-break'] = {
		width:    580,
		lineHeight: 1.25,
		overflow: TextBox.Overflow.BreakText,
		background: Color.DarkGrey,

		marginTop:  10,
		marginLeft:  10,
		marginRight: 10,

		fontSize: 18
    };
    
    
    this.textboxes = [];
    for(textboxPresetName in textboxPresets) {
    	textboxPreset = textboxPresets[textboxPresetName];
	    var textbox = new TextBox("Lorem ipsum", "Verdana", textboxPreset.fontSize ? textboxPreset.fontSize : 20, textboxPreset);
	    this.textboxes[textboxPresetName] = textbox;
    }

    // Layout
    var y = 70;
    this.textboxes['default'].setPosition(20, y); y += this.textboxes['default'].height + 10;
    this.textboxes['defined-width'].setPosition(20, y); y += this.textboxes['defined-width'].height + 10;
    this.textboxes['defined-width-limit'].setPosition(20, y); y += this.textboxes['defined-width-limit'].height + 10;
    this.textboxes['defined-width-and-height'].setPosition(20, y); y += this.textboxes['defined-width-and-height'].height + 10;
    this.textboxes['defined-width-and-height-scale-text'].setPosition(20, y); y += this.textboxes['defined-width-and-height-scale-text'].height + 10;
    this.textboxes['defined-width-break'].setPosition(20, y);

    // Info text
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