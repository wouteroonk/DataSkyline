var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access

var configLocation = "./config.json";

// Returns a list of modules and their info + their views and their info + their windows and their info
exports.getModules = function() {
  return {modules: DataManager.getAllModulesFull()};
};
