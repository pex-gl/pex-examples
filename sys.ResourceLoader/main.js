var ResourceLoader = require('pex-sys/ResourceLoader');
var isBrowser = require('is-browser');

var ASSET_PATH = isBrowser ? '../assets' : __dirname + '/../assets';

var validResources = {
    icon  : { image: ASSET_PATH + '/textures/plask.png' },
    data  : { json: ASSET_PATH + '/text/loremipsum.json' }
};

var invalidResources = {
    icon  : { image: 'invalidpath/9383734.png' },
    data  : { json: 'invalidpath/blabla.json' }
};

ResourceLoader.load(validResources, function(err, res) {
    console.log('icon', res.icon.width, res.icon.height);
    console.log('data lines', res.data.length);
})

ResourceLoader.load(invalidResources, function(err, res) {
    console.log(err);
})
