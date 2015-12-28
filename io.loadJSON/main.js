var loadJSON = require('pex-io/loadJSON');
var isBrowser = require('is-browser');
var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';

loadJSON(ASSET_PATH + '/text/loremipsum.json', function(err, lines) {
    console.log(lines);
})
