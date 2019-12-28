"use strict";

const { gulp, src, dest, series } = require("gulp");
const del = require("del");
const download = require("gulp-download-files");
const minCSS = require("gulp-clean-css");
const minJS = require("gulp-minify");
const rename = require("gulp-rename");
const replace = require("gulp-html-replace");
const exec = require("gulp-exec");
const imagemin = require("gulp-imagemin");

function clean() {
  return del(["./dist/*"]);
}

function install_index() {
  return src('src/index.html')
	  .pipe(dest('dist/'));
}

function install_bootstrap() {
  return src(['node_modules/bootstrap/dist/css/bootstrap.css', 'node_modules/bootstrap/dist/js/bootstrap.js'], {base: 'node_modules/bootstrap/dist/'})
	  .pipe(dest('src/assets/'));
}

function install_jquery() {
  return download('https://code.jquery.com/jquery-3.4.1.js')
	  .pipe(dest('src/assets/js/'));
}

function install_dropzone_js() {
  return download('https://rawgit.com/enyo/dropzone/master/dist/dropzone.js')
    .pipe(dest('src/assets/js/'));
}

function install_dropzone_css() {
	return download('https://rawgit.com/enyo/dropzone/master/dist/dropzone.css')
	  .pipe(dest('src/assets/css/'));
  }

function min_css() {
  return src('src/assets/css/*.css')
	  .pipe(minCSS())
		.pipe(rename({ extname: ".min.css"}))
		.pipe(dest('dist/assets/css/'));
}

function min_js() {
  return src('src/assets/js/*.js')
	  .pipe(minJS({noSource: true}))
//		.pipe(rename({ extname: ".min.js"}))
		.pipe(dest('dist/assets/js/'));
}

function replace_path() {
  return src('src/index.html')
	  .pipe(replace({
		  'js': [
			  'assets/js/jquery-3.4.1-min.js',
			'assets/js/bootstrap-min.js',
			'assets/js/dropzone-min.js'
			],
		  'css': [
			'assets/css/bootstrap.min.css', 
			'assets/css/dropzone.min.css',
			'assets/css/main.min.css'
		  ]
		}))
		.pipe(dest('dist/'));
}

function build_docker() {
  return src('../')
    .pipe(exec('docker build -t mcupload /core/bootstrap/mcupload/'))
}

function stop_composer() {
  return src('../')
   .pipe(exec('docker-compose -f /core/docker/mcupload/docker-compose.yml down'))
}

function start_composer() {
  return src('../')
   .pipe(exec('docker-compose -f /core/docker/mcupload/docker-compose.yml up -d'))
}

function image_min() {
	return src('src/assets/images/*')
	  .pipe(imagemin())
	  .pipe(dest('dist/assets/images'))
}

exports.clean = clean
exports.install_index = install_index
exports.install_bootstrap = install_bootstrap 
exports.install_jquery = install_jquery
exports.install_dropzone_js = install_dropzone_js
exports.install_dropzone_css = install_dropzone_css
exports.min_css = min_css
exports.min_js = min_js
exports.replace_path = replace_path
exports.build_docker = build_docker
exports.stop_composer = stop_composer
exports.start_composer = start_composer
exports.image_min = image_min
exports.min = series(min_css, min_js)
exports.rebase = series(install_bootstrap, install_jquery, install_dropzone_js, install_dropzone_css)
exports.build = series(clean, image_min, min_css, min_js, replace_path, build_docker, stop_composer, start_composer)