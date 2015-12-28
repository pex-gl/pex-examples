var loadBinary = require('pex-io/loadBinary');
var isBrowser = require('is-browser');
var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

loadBinary(ASSET_PATH + '/textures/plask.png', function(err, arraybuffer) {
    //should print PNG
    console.log(ab2str(arraybuffer.slice(0, 4)));
})
