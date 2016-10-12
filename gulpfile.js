"use strict";

var gulp = require("gulp");
var liveServer = require("gulp-live-server");
var less = require("gulp-less");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var ngAnnotate = require('browserify-ngannotate');
var purify = require("gulp-purifycss");
var stripCssComments = require("gulp-strip-css-comments");
var htmlmin = require("gulp-htmlmin");
var ngHtml2Js = require("gulp-ng-html2js");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var clean = require("gulp-clean");
var CacheBuster = require("gulp-cachebust");

var cachebust = new CacheBuster();

var production = (process.env.NODE_ENV === "production");

var libs = [
    "angular",
    "angular-ui-router"
];


gulp.task("css", function(){
    var stream = gulp.src("app/style.less").pipe(less());

    if (production) {
        stream = stream.pipe(purify(["./app/**/*.html", "./frontend/**/*.js"], { minify: true }))
            .pipe(stripCssComments({ preserve: false }));
    }

    return stream.pipe(cachebust.resources())
        .pipe(gulp.dest("dist/"));
});


gulp.task("vendor", function() {
    var b = browserify({ entries: "app/noop.js", debug: false});
    libs.forEach(function(lib) { b.require(lib); } );

    var stream = b.bundle()
        .pipe(source("vendors.js"));

    if (production) stream = stream.pipe(buffer()).pipe(uglify());

     return stream.pipe(cachebust.resources())
         .pipe(gulp.dest("dist/"));
});


gulp.task('templates', function() {
    var stream = gulp.src("app/*/**/*.html");

    if (production) { stream = stream.pipe(htmlmin()); }

    stream = stream.pipe(ngHtml2Js({
            moduleName: "templates",
            prefix: ""
        }))
        .pipe(concat("templates.js"));

    if (production) { stream = stream.pipe(uglify()); }

    return stream.pipe(gulp.dest("./dist"));
});


gulp.task("app", ["templates"], function() {
    var b = browserify({
        entries: ["app/index.js", "dist/templates.js"],
        debug: !production,
        read: false,
        transform: [ngAnnotate]
    });
    libs.forEach(function(lib) { b.external(lib) });

    var stream = b.bundle()
        .pipe(source("app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}));

    if (production) stream.pipe(uglify());

    return stream.pipe(sourcemaps.write("./"))
        .pipe(cachebust.resources())
        .pipe(gulp.dest("dist/"));
});


gulp.task("build", ["css", "vendor", "app"], function () {
    return gulp.src("app/index.html")
        .pipe(cachebust.references())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("dist"));
});


gulp.task("watch", ["build"], function () {
    var server = liveServer.new("server/index.js");
    server.start();

    gulp.watch(["server/**/*.js"], server.start.bind(server));
    gulp.watch(["app/*.js", "app/**/*.js", "app/**/*.html"], function(file) {
        gulp.run("build");
        server.notify.apply(server, [file]);
    });
});
