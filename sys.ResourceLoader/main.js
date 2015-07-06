var ResourceLoader = require('pex-sys/ResourceLoader');

var validResources = {
    icon  : { image: '../assets/textures/plask.png' },
    data  : { json: '../assets/text/loremipsum.json' }
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
