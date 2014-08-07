var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var PLASK_CMD = '/Users/vorg/Dev/plask/DerivedData/plask/Build/Products/Release/Plask.app/Contents/MacOS/Plask';

//list of examples' folders
var examplesPath = path.join(__dirname, '..', 'src');
var examplesFolders = fs.readdirSync(examplesPath).filter(function(dir) { return dir[0] != '.'; });
var examples = examplesFolders.map(function(dir) {
  return {
    name: dir,
    mainFile: path.join(examplesPath, dir, 'main.js')
  };
});

//runs example's main.js in Plask
//waits 500
//fails on any message in stderr
//passes otherwise
function runNext() {
  var example = examples.shift();
  if (!example) return;

  process.stdout.write('Running ' + example.name);
  var p = spawn(PLASK_CMD, [ example.mainFile ]);

  var closeTimeout = setTimeout(function() {
    p.kill();
    process.stdout.write(' - OK');
    process.stdout.write('\n');
    runNext();
  }, 500);

  p.stderr.on('data', function (data) {
    var lines = ('' + data) .split('\n');
    p.kill();
    clearTimeout(closeTimeout);
    process.stdout.write(' - FAILED : ' + lines[1]);
    process.stdout.write('\n');
    runNext();
  });
}

runNext();
