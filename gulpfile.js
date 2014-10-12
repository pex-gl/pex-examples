var async = require("async");
var browserify = require("browserify");
var chalk = require("chalk");
var chmod = require("gulp-chmod");
var dateformat = require("dateformat");
var ejs = require("gulp-ejs");
var fs = require("fs");
var gulp = require("gulp");
var httpServer = require("http-server");
var rename = require("gulp-rename");
var slimerPath = require("slimerjs").path;
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

var exampleHtml = function(dir, callback) {
	var src = "./templates/example.ejs";
	var dest = "./dist/examples/" + dir;

	gulp.src(src)
		.pipe(ejs({ title: dir }))
		.pipe(rename("index.html"))
		.pipe(gulp.dest(dest))
		.on("finish", callback);
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
					if (!stat.isDirectory()) { return callback(); }

					async.series(
						[
							mkdir.bind(this, "./dist/examples/" + dir),
							exampleHtml.bind(this, dir),
							runBrowserify.bind(this, dir)
						],
						callback
					);
				});
			},
			callback
		);
	});
});

gulp.task("file-structure", function(callback) {
	log(chalk.cyan("file structure") + " building");

	async.each(
		[ "./dist/examples", "./dist/assets" ],
		mkdir,
		function() {
			gulp
				.src("./assets/**")
				.pipe(gulp.dest("./dist/assets/"))
				.on("finish", function() {
					log(chalk.cyan("file structure") + " done");
					callback();
				});
		}
	);
});

var slimerScreenshot = function(dir, callback) {
	var spawned = spawn(slimerPath, [ "./utils/slimer-script.js", dir + "/thumb.png" ]);

	spawned.stdout.on("data", function(data) {
		log("slimer " + chalk.cyan(dir) + "\n" + data.toString());
	});

	spawned.on("exit", callback);
};

var startHttpServer = function(dir, callback) {
	var server = httpServer.createServer({ root: dir });
	server.listen(3000, callback.bind(this, server));
};

var moveScreenshot = function(dir, callback) {
	spawn("mv", [ __dirname + "/page.png", dir + "/thumb.png" ]).on("exit", callback);
};

gulp.task("make-screenshots", function(callback) {
	fs.readdir("./dist/examples/", function(error, directories) {
		if (error) { return console.error(error); }

		async.eachSeries(
			directories,

			function(dir, callback) {
				fs.stat("./dist/examples/" + dir, function(error, stat) {
					if (error) { return callback(error); }
					if (!stat.isDirectory()) { return callback(); }

					var server = null;
					dir = __dirname + "/dist/examples/" + dir;

					async.series(
						[
							function(callback) {
								startHttpServer(dir, function(instance) {
									server = instance;
									callback();
								});
							},

							slimerScreenshot.bind(this, dir),
							moveScreenshot.bind(this, dir)
						],
						function() {
							server.close();
							callback();
						}
					);
				});
			},

			callback
		);
	});
});

gulp.task("build-index", function(callback) {
	var src = "./templates/index.ejs";
	var dest = "./dist/";

	fs.readdir("./dist/examples/", function(error, directories) {
		if (error) { return console.error(error); }

		async.filter(
			directories,

			function(dir, callback) {
				fs.stat("./dist/examples/" + dir, function(error, stat) {
					if (error) { return callback(error); }
					callback(stat.isDirectory());
				});
			},

			function(examples) {
				gulp
					.src(src)
					.pipe(ejs({ examples: examples }))
					.pipe(gulp.dest(dest))
					.on("finish", callback);
			}
		);
	});
});

gulp.task("dist", function() {
	async.eachSeries(
		[
			"browserify",
			"make-screenshots",
			"build-index"
		],
		function(task, callback) {
			gulp.run(task, callback);
		}
	);
});
