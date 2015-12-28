var Window = require('pex-sys/Window');
var glslify = require('glslify-promise');

var isBrowser = require('is-browser');

var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';


Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    //TODO: it's tempting to include some kind of CWD (current working directory) support so we don't need to ASSETS_PATH = isBorwser ? 'assets' : __dirname + '/assets/'
    //TODO: check if glslify still works if we don't use __dirname but ASSETS_PATH
    resources: {
        plaskIcon  : { image: ASSET_PATH + '/textures/plask.png' },
        basicVert  : { glsl: glslify(__dirname + '/../assets/glsl/Basic.vert') },
        basicFrag  : { glsl: glslify(__dirname + '/../assets/glsl/Basic.frag') },
        data       : { json: ASSET_PATH + '/text/data.json' }
    },
    init: function() {
        var res = this.getResources();
        console.log('init');
        console.log('plaskIcon', res.plaskIcon.width,  res.plaskIcon.height);
        console.log('vert', res.basicVert);
        console.log('frag', res.basicFrag);
        console.log('color', res.data.color);

        this.clearColor = res.data.color;
    },
    draw: function() {
        var ctx = this.getContext();
        ctx.setClearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
        ctx.clear(ctx.COLOR_BIT);
    }
})
