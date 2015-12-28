var loadImage = require('pex-io/loadImage');
var isBrowser = require('is-browser');
var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';

loadImage(ASSET_PATH + '/textures/plask.png', function(err, img) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(img.width, img.height);
    }
})
