var assert = require('assert'); // For asserts
var DataManager = require('../datamanager.js');
var fs = require('fs'); // For file system access

var configLocation = "./config.json";

// Returns the list of screens stored in config.json
exports.getScreens = function() {
  var config = DataManager.getJSONObjectFromFilepath(configLocation);
  return config.screens;
};
