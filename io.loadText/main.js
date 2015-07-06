var loadText = require('pex-io/loadText');

loadText('../assets/text/loremipsum.txt', function(err, str) {
    console.log(str);
})
