var async = require("async");
var browserify = require("browserify");
var chalk = require("chalk");
var chmod = require("gulp-chmod");
var dateformat = require("dateformat");
var fs = require("fs");
var gulp = require("gulp");
var source = require("vinyl-source-stream");
var spawn = require("child_process").spawn;

var log = function() {
	var time = "[" + chalk.blue(dateformat(new Date(), "HH:MM:ss")) + "]";
	var args = Array.prototype.slice.call(arguments);
	args.unshift(time);
	console.log.apply(console, args);
};

var runBrowserify = function(dir, callback) {
	var src = "./src/" + dir;
	var file = src + "/main.js";
	var dest = "./dist/examples/" + dir;

	var bundler = browserify(file);

	log("browserify " + chalk.cyan(dir) + " started");

	bundler.transform({ global: true }, "brfs");
	bundler.ignore("plask");

	bundler.on("log", function(data) {
		var logString = data.split(" ").map(function(word) {
			word = word.replace(/\(|\)/g, "");
			return !isNaN(word) ? chalk.magenta(word) : word;
		}).join(" ");

		log("browserify " + chalk.cyan(dir) + " " + logString);
	});

	bundler.on("error", function(error) {
		log(chalk.red(error.message));
	});

	bundler
		.bundle()
		.pipe(source("main.min.js"))
		.pipe(chmod(644))
		.pipe(gulp.dest(dest))
		.on("finish", function() {
			log("browserify " + chalk.cyan(dir) + " finished!");
			callback();
		});
};

var copyHtml = function(dir) {
	var src = "./templates/index.html";
	var dest = "./dist/" + dir;

	gulp.src(src).pipe(gulp.dest(dest));
};

var mkdir = function(dir, callback) {
	spawn("mkdir", [ "-p", dir ]).on("exit", callback);
};

gulp.task("browserify", [ "file-structure" ], function(callback) {
	var limit = 4;

	fs.readdir("./src/", function(error, directories) {
		if (error) { return console.error(error); }

		async.eachLimit(
			directories,

			limit,

			function(dir, callback) {
				fs.stat("./src/" + dir, function(error, stat) {
					if (error) { return callback(error); }

					if (stat.isDirectory()) {
						mkdir("./dist/examples/" + dir, function() {
							runBrowserify(dir, callback);
							// copyHtml(dir);
							// copyAssets(dir);
						});
					}
					else {
						callback();
					}
				});
			},

			function() {
				callback();
			}
		);
	});
});

gulp.task("file-structure", function(callback) {
	async.each(
		[ "./dist/examples", "./dist/assets" ],
		mkdir,
		function() {
			gulp
				.src("./assets/**")
				.pipe(gulp.dest("./dist/assets/"))
				.on("finish", function() {
					callback();
				});
		}
	);
});

gulp.task("dist", [ "browserify" ]);
