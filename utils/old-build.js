var fs = require('fs');
var path = require('path');
var browserify = require('browserify');

var exampleIndexTemplate = 'templates/index.example.html';
var tocIndexTemplate = 'templates/index.toc.html';

function copyFile(from, to) {
  return fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

//list of examples' folders
var examplesPath = path.join(__dirname, 'src');
var examplesFolders = fs.readdirSync(examplesPath).filter(function(dir) { return dir[0] != '.'; });
var examples = examplesFolders.map(function(dir) {
  return {
    name: dir,
    mainFile: path.join(examplesPath, dir, 'main.js')
  };
});

//make index
var links = examples.map(function(example) {
  return '<a href="src/' + example.name + '/">' + example.name + '</a><br/>'
}).join('\n');

var indexSource = fs.readFileSync(tocIndexTemplate, 'utf8');
indexSource = indexSource.replace('LINKS', links);
fs.writeFileSync('index.html', indexSource);

//runs example's main.js in Plask
//waits 500
//fails on any message in stderr
//passes otherwise
function runNext() {
  var example = examples.shift();
  if (!example) {
    return;
  }

  console.log(example.name + ' / ' + examples.length + ' left...');

  var exampleDir = path.dirname(example.mainFile);
  var outFile = path.join(exampleDir, 'main.web.js');
  var outIndexFile = path.join(exampleDir, 'index.html');

  var b = browserify();
  b.add(example.mainFile);
  b.transform({global:true}, 'brfs');
  b.ignore('plask');
  var r = b.bundle().pipe(fs.createWriteStream(outFile));
  r.on('finish', function() {
    copyFile(exampleIndexTemplate, outIndexFile).on('finish', function() {
      runNext();
    });
  });
}

runNext();