var express = require('express'),
	fs = require('fs-extra'),
	path = require('path'),
	util = require('util'),
	Promise = require('bluebird'),
	errors = require('../errors'),
	config = require('../config'),
	utils = require('../utils'),
	baseStore = require('./base');

function LocalFileStore() {}
util.inherits(LocalFileStore, baseStore);
LocalFileStore.prototype.save = function(image, targetDir) {
	targetDir = targetDir || this.getTargetDir(config.paths.imagesPath);
	var targetFilename;
	return this.getUniqueFileName(this, image, targetDir).then(function(filename) {
		targetFilename = filename;
		return Promise.promisify(fs.mkdirs)(targetDir);
	}).then(function() {
		return Promise.promisify(fs.copy)(image.path, targetFilename);
	}).then(function() {
		var fullUrl = (config.paths.subdir + '/' + config.paths.imagesRelPath + '/' +
			path.relative(config.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');
		return fullUrl;
	}).
	catch (function(e) {
		errors.logError(e);
		return Promise.reject(e);
	});
};

LocalFileStore.prototype.exists = function(filename) {
	return new Promise(function(resolve) {
		fs.stat(filename, function(err) {
			var exists = !err;
			resolve(exists);
		});
	});
};

LocalFileStore.prototype.serve = function() {
	return express['static'](config.paths.imagesPath, {
		maxAge: utils.ONE_YEAR_MS
	});
};

module.exports = LocalFileStore;