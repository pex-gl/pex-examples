var loadText = require('pex-io/loadText');
var isBrowser = require('is-browser');
var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';

loadText(ASSET_PATH + '/text/loremipsum.txt', function(err, str) {
    console.log(str);
})
