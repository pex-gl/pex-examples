var loadBinary = require('pex-io/loadBinary');

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

loadBinary('../assets/textures/plask.png', function(err, arraybuffer) {
    //should print PNG
    console.log(ab2str(arraybuffer.slice(0, 4)));
})
