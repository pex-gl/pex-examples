/*global slimer */

var webpage = require("webpage").create();
var messages = [];

var system = require("system");
var args = system.args;

var url = args[1] || "";
var thumbPath = args[2] || "";

webpage.onConsoleMessage = function(message, line, file) {
  console.log(message);
};

webpage.onError = function(message) {
  console.log(message);
};

webpage
  .open(url)
  .then(function() {
    webpage.viewportSize = { width: 400, height: 300 };
    webpage.reload();

    setTimeout(function() {
      webpage.render(thumbPath, { onlyViewport: true });

      webpage.close();
      slimer.exit();
    }, 500);
  });
