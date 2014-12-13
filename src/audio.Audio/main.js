var sys = require('pex-sys');
var glu = require('pex-glu');
var Color = require('pex-color').Color;
var GUI = require('pex-gui').GUI;
var Audio = require('pex-audio').Audio;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: sys.Platform.isBrowser
  },
  progress: 0,
  init: function() {
    this.audio = new Audio('../../assets/audio/demo-it.mp3');
    this.audio.play();

    this.gui = new GUI(this);
    this.gui.addHeader('CONTROLS');
    this.gui.addLabel('Playing demo-it.mp3');
    this.isPlayingLabel = this.gui.addLabel('Is playing');
    this.currentTimeLabel = this.gui.addLabel('Current time');
    this.gui.addParam('Progress', this, 'progress');
    this.gui.addParam('Volume', this.audio, 'volume');
    this.gui.addParam('Loop', this.audio, 'loop');

    this.gui.addButton('Play / Pause', this, 'playPause');
  },
  playPause: function() {
    if (this.audio.isPlaying) {
      this.audio.pause();
    }
    else {
      this.audio.play();
    }
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);

    this.progress = this.audio.currentTime / this.audio.duration;
    this.isPlayingLabel.setTitle('Is playing: ' + this.audio.isPlaying);
    this.currentTimeLabel.setTitle('Curr Time: ' + Math.floor(this.audio.currentTime*100)/100);

    this.gui.draw();
  }
});
