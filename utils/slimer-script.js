/*global slimer */

var webpage = require("webpage").create();
var messages = [];

webpage.onConsoleMessage = function(message, line, file) {
  console.log(message);
};

webpage.onError = function(message) {
  console.log(message);
};

webpage
  .open("http://localhost:3000")
  .then(function() {
    webpage.viewportSize = { width: 200, height: 150 };
    webpage.reload();

    setTimeout(function() {
      webpage.render("page.png", { onlyViewport: true });

      webpage.close();
      slimer.exit();
    }, 500);
  });
