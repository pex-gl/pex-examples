var loadImage = require('pex-io/loadImage');

loadImage('../assets/textures/plask.png', function(err, img) {
    console.log(img.width, img.height);
})
