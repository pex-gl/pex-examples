var loadJSON = require('pex-io/loadJSON');

loadJSON('../assets/text/loremipsum.json', function(err, lines) {
    console.log(lines);
})
